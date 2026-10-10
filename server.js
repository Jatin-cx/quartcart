'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://cdnjs.cloudflare.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://quartcart.onrender.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      },
    },
  })
);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────
// Stripe webhook needs raw body - mount that route BEFORE json parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// All other routes use JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Unknown API 404 Handler ──────────────────────────────────────────────
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// ─── Clean Extensionless Page Routes ──────────────────────────────────────
const cleanPages = new Set([
  'index',
  'products',
  'product-detail',
  'cart',
  'checkout',
  'login',
  'register',
  'account',
  'admin',
  'policies',
  'privacy',
  'terms',
  'forgot-password',
  'reset-password',
  '404',
]);

app.get('/:page', (req, res, next) => {
  const pageName = req.params.page.toLowerCase();
  if (cleanPages.has(pageName)) {
    const status = pageName === '404' ? 404 : 200;
    return res.status(status).sendFile(path.join(__dirname, 'public', `${pageName}.html`));
  }
  next();
});

// ─── 404 Not Found Page Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`QuickCart server running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
