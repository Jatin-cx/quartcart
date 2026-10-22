'use strict';

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// ─── GET /api/products/featured ───────────────────────────────────────────
// Must be defined BEFORE /:id to avoid 'featured' being interpreted as an ID
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(12);
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/products ─────────────────────────────────────────────────────
router.get(
  '/',
  [
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'newest']).withMessage('Invalid sort option'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { search, category, sort, page = 1, limit = 20 } = req.query;
      const filter = {};

      if (search) {
        filter.$text = { $search: search };
      }
      if (category) {
        filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(skip).limit(limit),
        Product.countDocuments(filter),
      ]);

      res.json({
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/products/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/products (Admin Only) ───────────────────────────────────────
router.post(
  '/',
  authMiddleware,
  authMiddleware.requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('images').optional().isArray(),
    body('isFeatured').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const product = await Product.create(req.body);
      res.status(201).json({ message: 'Product created.', product });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/products/:id (Admin Only) ────────────────────────────────────
router.put('/:id', authMiddleware, authMiddleware.requireAdmin, async (req, res, next) => {
  try {
    const disallowed = ['_id', '__v', 'slug', 'createdAt', 'updatedAt'];
    disallowed.forEach((k) => delete req.body[k]);

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
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

// ─── POST /api/products/:id/reviews (Submit Customer Star Rating & Review) ─
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const { rating, review, reviewerName } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Please select a star rating between 1 and 5.' });
    }
    if (!review || !String(review).trim()) {
      return res.status(400).json({ message: 'Please write a brief review comment.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.ratings.unshift({
      reviewerName: reviewerName && String(reviewerName).trim() ? String(reviewerName).trim() : 'Verified Shopper',
      rating: numericRating,
      review: String(review).trim().slice(0, 1000),
    });

    product.recalcAvgRating();
    await product.save();

    res.status(201).json({
      message: 'Customer review published.',
      product,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/products/:id (Admin Only) ─────────────────────────────────
router.delete('/:id', authMiddleware, authMiddleware.requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
