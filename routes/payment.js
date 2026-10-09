'use strict';

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// ─── POST /api/payment/create-intent ─────────────────────────────────────
router.post('/create-intent', async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'A positive amount (in cents) is required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount must be in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    // Stripe errors have a specific structure
    if (err.type && err.type.startsWith('Stripe')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// ─── POST /api/payment/webhook ────────────────────────────────────────────
// IMPORTANT: raw body required - must be mounted with express.raw in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle relevant events
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await Order.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { paymentStatus: 'paid', status: 'processing' }
        );
        console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await Order.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { paymentStatus: 'failed' }
        );
        console.warn(`PaymentIntent ${paymentIntent.id} failed.`);
        break;
      }

      default:
        // Unhandled event type - ignore
        break;
    }
  } catch (dbErr) {
    console.error('Error processing webhook event:', dbErr.message);
    // Still return 200 to acknowledge receipt
  }

  res.json({ received: true });
});

module.exports = router;
