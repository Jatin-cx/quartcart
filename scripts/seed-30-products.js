'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const Product = require('../models/Product');
const newProducts = require('../config/seedProducts');

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of newProducts) {
      const existing = await Product.findOne({ name: item.name });
      if (existing) {
        existing.description = item.description;
        existing.price = item.price;
        existing.category = item.category;
        existing.stock = item.stock;
        existing.images = item.images;
        existing.isFeatured = item.isFeatured;
        existing.ratings = item.ratings;
        existing.avgRating = item.avgRating;
        await existing.save();
        updatedCount++;
      } else {
        await Product.create(item);
        addedCount++;
      }
    }

    const totalCount = await Product.countDocuments();
    console.log(`Successfully processed products: Added ${addedCount}, Updated ${updatedCount}.`);
    console.log(`Total catalog products in database: ${totalCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed products:', err);
    process.exit(1);
  }
}

seedProducts();
