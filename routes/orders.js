'use strict';

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// ─── POST /api/orders ──────────────────────────────────────────────────────
router.post(
  '/',
  authMiddleware,
  [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.product').notEmpty().withMessage('Product ID required for each item'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.zip').trim().notEmpty().withMessage('ZIP is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('paymentIntentId').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { items, shippingAddress, paymentIntentId } = req.body;

      // Verify products and compute totals
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found.` });
        }
        if (product.stock < item.qty) {
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          qty: item.qty,
          image: product.images[0] || '',
        });

        totalAmount += product.price * item.qty;

        // Decrement stock
        product.stock -= item.qty;
        await product.save();
      }

      totalAmount = Math.round(totalAmount * 100) / 100;

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalAmount,
        paymentIntentId: paymentIntentId || null,
        paymentStatus: paymentIntentId ? 'pending' : 'pending',
      });

      res.status(201).json({ message: 'Order placed successfully.', order });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/orders/my ────────────────────────────────────────────────────
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images slug');

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/orders/:id ───────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Only allow owner to view their order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
