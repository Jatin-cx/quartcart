'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const demoProducts = [
  {
    name: 'AURA Spatial Studio Pro Headphones',
    description: 'Precision-tuned 45mm neodymium drivers, hybrid active noise cancellation, custom spatial audio profiling, and 40-hour ultra-low latency wireless playback. For creators and audiophiles who refuse to compromise.',
    price: 349.00,
    category: 'Audio',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 4.9,
  },
  {
    name: 'VORTEX Chrono-01 Titanium Field Watch',
    description: 'Grade 5 aerospace titanium chassis with double-domed anti-reflective sapphire crystal, automatic 28,800 vph movement, and 200m depth rating. Rugged elegance designed to outlast generations.',
    price: 489.00,
    category: 'Timepieces',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 5.0,
  },
  {
    name: 'ARC Urban GORE-TEX Storm Parka',
    description: 'Three-layer waterproof breathable shell with taped micro-seams, articulated sleeves for unrestricted movement, magnetic storm flap, and concealed YKK Aquaguard utility compartments.',
    price: 295.00,
    category: 'Apparel',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 4.8,
  },
  {
    name: 'MONOLITH CNC Mechanical Keyboard',
    description: 'Solid billet aluminum enclosure anodized in matte obsidian. Hot-swappable PCB, hand-lubed linear switches, gasket mounted acoustics, and south-facing RGB per-key illumination.',
    price: 220.00,
    category: 'Tech & EDC',
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: false,
    avgRating: 4.9,
  },
  {
    name: 'NOMAD Full-Grain Waxed Leather Duffel',
    description: 'Handcrafted from 2.2mm vegetable-tanned Italian leather with heavy brass hardware, waterproof nylon lining, and dedicated ventilated sneaker compartment. Ages into a rich, personalized patina.',
    price: 265.00,
    category: 'Leather Goods',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 4.9,
  },
  {
    name: 'APEX Carbon-Plate Stealth Sneakers',
    description: 'Proprietary supercritical foam midsole integrated with a full-length curved carbon fiber propulsion plate. Breathable monofilament ripstop upper with reflective accents.',
    price: 185.00,
    category: 'Footwear',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 4.7,
  },
  {
    name: 'KURA Minimalist Smart Horizon Lamp',
    description: 'Sculptural cast-concrete base with an ultra-thin curved OLED arc. Circadian rhythm ambient lighting simulation with touch-capacitive gesture dimming.',
    price: 160.00,
    category: 'Home & Living',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: false,
    avgRating: 4.6,
  },
  {
    name: 'OBSIDIAN Artisanal Japanese Santoku Knife',
    description: '67 layers of forged Damascus steel with VG-10 super core (62 HRC). Octagonal charred pakkawood handle balanced for razor-sharp, effortless culinary precision.',
    price: 135.00,
    category: 'Home & Living',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
    avgRating: 5.0,
  }
];

async function seed() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<db_password>')) {
    console.error('❌ Please set your MongoDB password in .env before running seed.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Seeding luxury catalog...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    for (const p of demoProducts) {
      await Product.create(p);
    }

    console.log(`✅ Successfully seeded ${demoProducts.length} premium products!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
