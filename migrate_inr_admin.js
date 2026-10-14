'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const SiteConfig = require('./models/SiteConfig');

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Ensure Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'akash628484@gmail.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Akash@6283077';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'QuickCart Owner (Akash)',
        email: adminEmail,
        password: adminPass,
        role: 'admin',
      });
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      admin.password = adminPass; // Triggers bcrypt pre-save hash
      if (!admin.name || admin.name === 'Default Admin') {
        admin.name = 'QuickCart Owner (Akash)';
      }
      await admin.save();
      console.log(`Updated admin user credentials and role for: ${adminEmail}`);
    }

    // 2. Update SiteConfig
    let config = await SiteConfig.findOne({ key: 'main' });
    if (!config) {
      config = await SiteConfig.create({
        key: 'main',
        freeShippingThreshold: 999,
        studioPrice: 24999,
        announcementText: 'Free standard shipping on orders over ₹999 / 30-day return policy / Secure checkout powered by Stripe',
      });
      console.log('Created SiteConfig with INR defaults.');
    } else {
      config.freeShippingThreshold = 999;
      config.studioPrice = 24999;
      config.announcementText = 'Free standard shipping on orders over ₹999 / 30-day return policy / Secure checkout powered by Stripe';
      await config.save();
      console.log('Updated SiteConfig with INR defaults.');
    }

    // 3. Update Existing Products with INR prices
    const inrPriceMap = {
      'Studio Monitor Headphones': 24999,
      'Titanium Field Watch 40mm': 34999,
      'Technical All-Weather Storm Parka': 18499,
      'CNC Aluminum Mechanical Keyboard': 14999,
      'Full-Grain Leather Weekender Duffel': 16499,
      'Carbon-Plate Road Running Shoes': 12999,
      'Cast Concrete Minimalist Desk Lamp': 8999,
      'Damascus Steel Santoku Chef Knife': 7499,
      'Full-Grain Saddle Weekender Bag': 16499,
      'Chronograph Field Titanium Watch': 34999,
    };

    const products = await Product.find({});
    let updatedProducts = 0;
    for (const p of products) {
      if (inrPriceMap[p.name]) {
        p.price = inrPriceMap[p.name];
        await p.save();
        updatedProducts++;
      } else if (p.price < 1000) {
        // Convert old USD price to realistic INR
        p.price = Math.round(p.price * 85);
        await p.save();
        updatedProducts++;
      }
    }
    console.log(`Updated ${updatedProducts} products to INR pricing.`);

    console.log('Migration finished successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
