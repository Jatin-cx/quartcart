'use strict';

const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true,
    },
    storeName: {
      type: String,
      default: 'QuickCart',
    },
    announcementText: {
      type: String,
      default: 'Free standard shipping across India on orders over ₹999 / Instant UPI & Google Pay / 30-day returns',
    },
    heroBadge: {
      type: String,
      default: 'FLAGSHIP RELEASE 2026',
    },
    heroTitleLine1: {
      type: String,
      default: 'Precision Sound.',
    },
    heroTitleGradient: {
      type: String,
      default: 'Engineered to Endure.',
    },
    heroSubtitle: {
      type: String,
      default: 'Machined aerospace-grade aluminum, 45mm neodymium acoustic drivers, and low-latency studio fidelity. Built for audio engineers, creators, and focused listening.',
    },
    heroPrimaryCtaText: {
      type: String,
      default: 'Explore Catalog',
    },
    heroSecondaryCtaText: {
      type: String,
      default: 'Audio Systems',
    },
    studioModelName: {
      type: String,
      default: 'Studio Monitor Pro',
    },
    studioPrice: {
      type: Number,
      default: 24999,
    },
    themePalette: {
      type: String,
      enum: ['cerulean_rose', 'terracotta', 'emerald', 'gold', 'crimson', 'cobalt'],
      default: 'cerulean_rose',
    },
    enable3DBackground: {
      type: Boolean,
      default: true,
    },
    footerTagline: {
      type: String,
      default: 'Functional goods, precision manufacturing, and durable essentials built for longevity.',
    },
    supportEmail: {
      type: String,
      default: 'support@quickcart.com',
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
