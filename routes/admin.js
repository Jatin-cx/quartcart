'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const SiteConfig = require('../models/SiteConfig');
const authMiddleware = require('../middleware/auth');

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const OWNER_MASTER_KEY = process.env.ADMIN_MASTER_KEY || 'kala_hu_re';

/**
 * Helper: ensure default Owner/Admin account exists so the website owner is never locked out
 */
async function ensureOwnerAccount() {
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'akash628484@gmail.com').toLowerCase();
  const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Akash@6283077';

  let owner = await User.findOne({ email: defaultAdminEmail });
  if (!owner) {
    owner = await User.create({
      name: 'QuickCart Owner (Akash)',
      email: defaultAdminEmail,
      password: defaultAdminPass,
      role: 'admin',
    });
  } else {
    owner.role = 'admin';
    owner.password = defaultAdminPass; // Mongoose pre-save hook re-hashes if modified
    await owner.save();
  }
}

/**
 * Helper: get or initialize singleton SiteConfig document
 */
async function getOrCreateConfig() {
  let config = await SiteConfig.findOne({ key: 'main' });
  if (!config) {
    config = await SiteConfig.create({ key: 'main' });
  }
  return config;
}

// ─── GET /api/admin/config (Publicly readable for live storefront sync) ────
router.get('/config', async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ config });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/login (Dedicated Owner & Admin Authentication) ────────
router.post('/login', adminAuthLimiter, async (req, res, next) => {
  try {
    await ensureOwnerAccount();

    const { email, password, masterKey } = req.body;

    // Direct Owner Master Key Unlock (instant access without lockout)
    if (masterKey && String(masterKey).trim() === OWNER_MASTER_KEY) {
      const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'akash628484@gmail.com').toLowerCase();
      const owner = await User.findOne({ email: defaultAdminEmail });
      if (owner) {
        owner.role = 'admin';
        await owner.save();
        const token = jwt.sign({ id: owner._id, role: 'admin' }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        return res.json({
          message: 'Owner Master Key verified. Admin Vault unlocked.',
          token,
          user: owner.toJSON(),
        });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Admin email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    // If account is not yet admin, check if they provided the Owner Master Key to elevate
    if (user.role !== 'admin') {
      if (masterKey && String(masterKey).trim() === OWNER_MASTER_KEY) {
        user.role = 'admin';
        await user.save();
      } else {
        return res.status(403).json({
          message:
            'Access denied. This account does not have Website Owner or Administrator privileges.',
        });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Administrator authenticated.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

// ─── STRICT AUTHENTICATION & ADMIN AUTHORIZATION GATE FOR ALL ROUTES BELOW ─
router.use(authMiddleware, authMiddleware.requireAdmin);

// ─── PUT /api/admin/config (Update any part of the site live) ──────────────
router.put('/config', async (req, res, next) => {
  try {
    const allowedFields = [
      'storeName',
      'announcementText',
      'heroBadge',
      'heroTitleLine1',
      'heroTitleGradient',
      'heroSubtitle',
      'heroPrimaryCtaText',
      'heroSecondaryCtaText',
      'studioModelName',
      'studioPrice',
      'themePalette',
      'enable3DBackground',
      'footerTagline',
      'supportEmail',
      'freeShippingThreshold',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'main' },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Site configuration updated and published live.', config });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/overview (All-in-one fast load for Admin Dashboard) ────
router.get('/overview', async (req, res, next) => {
  try {
    const [products, orders, users, config] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }),
      Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email'),
      User.find({}).sort({ createdAt: -1 }),
      getOrCreateConfig(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const lowStockCount = products.filter((p) => p.stock <= 5).length;

    res.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        lowStockCount,
      },
      products,
      orders,
      users,
      config,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/products (Create Product) ─────────────────────────────
router.post('/products', async (req, res, next) => {
  try {
    const { name, description, price, category, stock, images, isFeatured } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required.' });
    }

    const parsedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === 'string' && images.trim()
      ? images.split(',').map((s) => s.trim()).filter(Boolean)
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

    const product = await Product.create({
      name: name.trim(),
      description: (description || `${name} crafted with durable materials.`).trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock !== undefined ? stock : 25),
      images: parsedImages,
      isFeatured: Boolean(isFeatured),
    });

    res.status(201).json({ message: 'Product added to catalog.', product });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/products/:id (Update Product) ──────────────────────────
router.put('/products/:id', async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;

    if (typeof updates.images === 'string') {
      updates.images = updates.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (updates.stock !== undefined) {
      updates.stock = Math.max(0, parseInt(updates.stock, 10) || 0);
    }
    if (updates.price !== undefined) {
      updates.price = Math.max(0, parseFloat(updates.price) || 0);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/admin/products/:id/stock (Direct / Stepper Stock Adjustment) ─
router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    const { delta, stock } = req.body;
    let product;

    if (stock !== undefined) {
      const newStock = Math.max(0, parseInt(stock, 10) || 0);
      product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { stock: newStock } },
        { new: true }
      );
    } else if (delta !== undefined) {
      const parsedDelta = parseInt(delta, 10) || 0;
      product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      product.stock = Math.max(0, (product.stock || 0) + parsedDelta);
      await product.save();
    } else {
      return res.status(400).json({ message: 'Either stock or delta must be provided.' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: `Stock updated to ${product.stock}.`, product });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/admin/products/:id/price (Direct Inline Price Adjustment) ──
router.patch('/products/:id/price', async (req, res, next) => {
  try {
    const { price } = req.body;
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ message: 'Valid price is required.' });
    }
    const newPrice = Math.max(0, parseFloat(price) || 0);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { price: newPrice } },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: `Price updated to INR ${newPrice}.`, product });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/products/:id (Delete Product) ───────────────────────
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product removed from catalog.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/products/seed (1-Click Add Curated Luxury Products) ───
router.post('/products/seed', async (req, res, next) => {
  try {
    const sampleProducts = [
      {
        name: 'Studio Monitor Headphones Pro',
        description: 'CNC-machined aluminum earcups with 45mm neodymium planar drivers and warm leather cushions.',
        price: 24999,
        category: 'Audio',
        stock: 28,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: true,
      },
      {
        name: 'Chronograph Field Titanium Watch',
        description: 'Grade 5 brushed titanium case with sapphire crystal glass and automatic mechanical movement.',
        price: 34999,
        category: 'Timepieces',
        stock: 14,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
        isFeatured: true,
      },
      {
        name: 'Full-Grain Saddle Weekender Bag',
        description: 'Vegetable-tanned Italian calfskin travel duffle with solid brushed brass hardware.',
        price: 16499,
        category: 'Leather Goods',
        stock: 19,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
        isFeatured: true,
      },
      {
        name: 'All-Weather Technical Storm Parka',
        description: 'Three-layer breathable waterproof membrane with sealed seams and thermal lining.',
        price: 18499,
        category: 'Apparel',
        stock: 32,
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=800'],
        isFeatured: true,
      },
    ];

    const created = [];
    for (const item of sampleProducts) {
      const exists = await Product.findOne({ name: item.name });
      if (!exists) {
        const doc = await Product.create(item);
        created.push(doc);
      }
    }

    res.json({
      message: created.length > 0 ? `Added ${created.length} flagship products.` : 'All flagship products are already in the catalog.',
      addedCount: created.length,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/orders/:id (Update Order Status / Payment Status) ──────
router.put('/orders/:id', async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ message: 'Order updated.', order });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/orders/:id (Delete Order) ───────────────────────────
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ message: 'Order deleted.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/users (Create User / Admin Account) ───────────────────
router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'customer',
    });
    res.status(201).json({ message: 'Account created.', user });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/users/:id (Update User Role, Details, or Password) ─────
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.email) user.email = req.body.email.toLowerCase().trim();
    if (req.body.role && ['customer', 'admin'].includes(req.body.role)) {
      user.role = req.body.role;
    }
    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    await user.save();
    res.json({ message: 'User account updated.', user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/users/:id (Delete User) ─────────────────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User account deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
