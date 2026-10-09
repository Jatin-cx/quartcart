'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Rate limiter: max 20 requests per 15 minutes on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Generate a signed JWT for a user ID.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }

      const user = await User.create({ name, email, password });
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { email, password } = req.body;

      // Specifically include password for verification
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email. Please create an account on the Register page first!' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect passcode. Try again or click "Forgot Passcode".' });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Login successful.',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/forgot-password ────────────────────────────────────────
router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Return friendly response to prevent email enumeration
        return res.json({
          message: 'If an account exists with that email, a password recovery link has been sent.',
        });
      }

      // Generate cryptographically secure random reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token and save to user document (valid for 15 minutes)
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

      await user.save({ validateBeforeSave: false });

      // Build reset URL
      const hostUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${hostUrl}/reset-password.html?token=${resetToken}`;

      // Email template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #08090d; color: #f8fafc; margin: 0; padding: 40px 20px; }
            .card { max-width: 520px; margin: 0 auto; background: #11141e; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px; }
            .brand { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 24px; letter-spacing: -0.5px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; margin: 24px 0; }
            .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">Quartcart</div>
            <h2 style="margin: 0 0 12px; font-size: 20px; color: #fff;">Passcode Reset Request</h2>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              Hello ${user.name}, we received a request to reset the passcode for your Quartcart client account. Click the secure link below to choose a new passcode:
            </p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Passcode →</a>
            </p>
            <p style="color: #64748b; font-size: 13px;">
              This link is single-use and will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.
            </p>
            <div class="footer">
              © 2026 Quartcart. 256-Bit SSL Encrypted Protocol.
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: 'Quartcart — Passcode Reset Request',
          text: `You requested a passcode reset. Visit: ${resetUrl}`,
          html: emailHtml,
        });

        res.json({
          message: 'Password recovery email sent! Check your inbox or spam folder.',
          resetUrl, // Provided for direct convenience in test / development environments
        });
      } catch (emailErr) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
      }
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/reset-password/:token ──────────────────────────────────
router.post(
  '/reset-password/:token',
  authLimiter,
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { token } = req.params;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: 'Passcode reset link is invalid or has expired. Please request a new one.',
        });
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      const authToken = generateToken(user._id);

      res.json({
        message: 'Passcode updated successfully! You are now logged in.',
        token: authToken,
        user: user.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/auth/profile (Protected) ────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/auth/profile (Protected) ────────────────────────────────────
router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
    body('address.street').optional().trim(),
    body('address.city').optional().trim(),
    body('address.state').optional().trim(),
    body('address.zip').optional().trim(),
    body('address.country').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.address) updates.address = { ...req.user.address.toObject(), ...req.body.address };

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ message: 'Profile updated.', user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
