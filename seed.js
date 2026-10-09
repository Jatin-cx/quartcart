'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const demoProducts = [
  {
    name: 'Studio Monitor Headphones',
    description: 'Precision-tuned 45mm neodymium drivers, active noise cancellation, and 40-hour battery life with low-latency wired and wireless connectivity. Built for audio engineers and focused listening.',
    price: 349.00,
    category: 'Audio',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  },
  {
    name: 'Titanium Field Watch 40mm',
    description: 'Machined Grade 5 aerospace titanium case with anti-reflective sapphire crystal, automatic 28,800 vph mechanical movement, and 200-meter water resistance rating.',
    price: 489.00,
    category: 'Timepieces',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  },
  {
    name: 'Technical All-Weather Storm Parka',
    description: 'Three-layer waterproof breathable shell with fully taped micro-seams, articulated sleeves for mobility, two-way storm zipper, and concealed utility pockets.',
    price: 295.00,
    category: 'Apparel',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  },
  {
    name: 'CNC Aluminum Mechanical Keyboard',
    description: 'Solid aluminum enclosure anodized in matte black. Hot-swappable PCB, factory-lubed mechanical linear switches, gasket-mounted acoustic dampening, and USB-C connectivity.',
    price: 220.00,
    category: 'Tech & EDC',
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: false,
  },
  {
    name: 'Full-Grain Leather Weekender Duffel',
    description: 'Handcrafted from 2.2mm vegetable-tanned full-grain leather with solid brass hardware, water-resistant interior lining, and dedicated ventilated compartment.',
    price: 265.00,
    category: 'Leather Goods',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  },
  {
    name: 'Carbon-Plate Road Running Shoes',
    description: 'High-rebound supercritical foam midsole paired with a full-length curved carbon fiber propulsion plate. Breathable monofilament engineered mesh upper.',
    price: 185.00,
    category: 'Footwear',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  },
  {
    name: 'Cast Concrete Minimalist Desk Lamp',
    description: 'Sculptural cast-concrete base with an anodized aluminum diffused LED arc. Touch-capacitive brightness control with memory preset.',
    price: 160.00,
    category: 'Home & Living',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: false,
  },
  {
    name: 'Damascus Steel Santoku Chef Knife',
    description: 'Forged 67-layer Damascus steel with a high-carbon core. Ergonomic octagonal wood handle balanced for precise kitchen prep.',
    price: 135.00,
    category: 'Home & Living',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=85'
    ],
    isFeatured: true,
  }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Please configure MONGODB_URI in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Seeding verified products...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    for (const p of demoProducts) {
      await Product.create(p);
    }

    console.log(`Successfully seeded ${demoProducts.length} verified products.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
