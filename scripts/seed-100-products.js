'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const Product = require('../models/Product');

const products = [
  // ==========================================
  // AUDIO (12 Products)
  // ==========================================
  {
    name: 'Pro Broadcast Dynamic XLR Microphone',
    description: 'Cardioid polar response pattern engineered for broadcast studios, podcast mastering, and vocal acoustic clarity.',
    price: 24999,
    category: 'Audio',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Aditya Rao', rating: 5, review: 'Exceptional background isolation and warm broadcast tone.' },
      { reviewerName: 'Meera Sen', rating: 5, review: 'Studio grade build with crisp frequency reproduction.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Compact Magnetic Wireless Speaker',
    description: 'Dual passive radiators in an IPX6 waterproof silicone enclosure with 18-hour continuous acoustic projection.',
    price: 5499,
    category: 'Audio',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sameer Joshi', rating: 4, review: 'Punchy bass for its compact profile. Sturdy magnetic mount.' },
      { reviewerName: 'Kunal Patil', rating: 5, review: 'Battery life easily lasts through weekend outdoor trips.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Audiophile In-Ear Monitor Earphones',
    description: 'Quad balanced armature drivers with silver-plated detachable MMCX cabling for uncolored acoustic precision.',
    price: 14999,
    category: 'Audio',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Naveen Nair', rating: 5, review: 'Micro-detail retrieval across high and mid ranges is remarkable.' },
      { reviewerName: 'Pooja Bhatia', rating: 5, review: 'Comfortable ergonomic mold and pure sound reproduction.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Solid Wood Hi-Fi Turntable Record Player',
    description: 'Belt-drive audiophile turntable featuring an isolated DC motor, carbon-fiber tonearm, and Ortofon cartridge.',
    price: 36999,
    category: 'Audio',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Devansh Kulkarni', rating: 5, review: 'Rich, organic vinyl warmth with zero motor rumble.' },
      { reviewerName: 'Ananya Roy', rating: 5, review: 'Stunning walnut plinth craftsmanship and rock solid tracking.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'USB-C Condenser Studio Podcast Mic',
    description: '24-bit 96kHz recording resolution with zero-latency headphone monitoring and integrated pop filtration.',
    price: 9999,
    category: 'Audio',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Gaurav Gill', rating: 4, review: 'Plug and play simplicity with crisp dialogue reproduction.' },
      { reviewerName: 'Tanvi Shah', rating: 5, review: 'Great microphone for voiceover and remote meetings.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Dual-Driver Wireless Sport Earhooks',
    description: 'Secure earhook architecture with sweat-sealed IPX8 coating, ambient awareness mode, and 30-hour playback.',
    price: 6999,
    category: 'Audio',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Manish Tiwari', rating: 5, review: 'Never slips even during intensive sprint sessions.' },
      { reviewerName: 'Rhea Singhania', rating: 4, review: 'Deep punchy bass response that keeps cadence on track.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Retro Analog Bluetooth Speaker',
    description: 'Vintage brass control dials, woven acoustic grille fabric, dual Class-D amplifiers, and Bluetooth 5.2.',
    price: 17999,
    category: 'Audio',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sanjay Deshmukh', rating: 5, review: 'Looks like a classic mid-century amp and fills the entire room.' },
      { reviewerName: 'Isha Kapoor', rating: 5, review: 'Tactile brass dials make tone adjustment pure pleasure.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Balanced Headphone Amplifier and DAC',
    description: 'Dual ESS Sabre DAC chips with 4.4mm balanced output, delivering ultra-low distortion and clean power headroom.',
    price: 21999,
    category: 'Audio',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520170350707-b2da59970118?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rahul Varma', rating: 5, review: 'Drives high-impedance headphones with pitch black silence.' },
      { reviewerName: 'Akash Gupta', rating: 5, review: 'Resolution and instrument separation are unmatched.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Foldable DJ Monitoring Headphones',
    description: 'Swiveling earcups with high-flux neodymium drivers, closed-back acoustic isolation, and coiled studio cable.',
    price: 11499,
    category: 'Audio',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Neil Dsouza', rating: 5, review: 'Durable hinge design and accurate low-end monitoring.' },
      { reviewerName: 'Swati Bansal', rating: 4, review: 'Tight acoustic seal blocks out stage monitor noise.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Portable Waterproof Outdoor Soundbox',
    description: 'Rugged rubberized bumper housing with 360-degree acoustic dispersion and integrated carabiner strap.',
    price: 4999,
    category: 'Audio',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Harsh Vardhan', rating: 5, review: 'Survived trail rainstorms without missing a beat.' },
      { reviewerName: 'Shreya Mittal', rating: 4, review: 'Loud, crisp output and very easy to pack in daypacks.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Acoustic Desktop Subwoofer Unit',
    description: 'Down-firing long-throw 8-inch driver with adjustable crossover frequency for compact nearfield listening environments.',
    price: 18499,
    category: 'Audio',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Karan Mehra', rating: 5, review: 'Tight, musical bass without boominess or cabinet vibration.' },
      { reviewerName: 'Alok Saxena', rating: 4, review: 'Seamlessly matches my bookshelf speakers.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Noise-Isolating Flight Audio Adapter Set',
    description: 'Dual-prong airplane audio converter with aptX Low Latency wireless transmitter and 22-hour battery life.',
    price: 3499,
    category: 'Audio',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rohit Shenoy', rating: 5, review: 'An essential for frequent flyers wanting wireless headphone audio.' },
      { reviewerName: 'Divya Khurana', rating: 5, review: 'Lag-free audio transmission on long haul flights.' }
    ],
    avgRating: 5.0
  },

  // ==========================================
  // TIMEPIECES (12 Products)
  // ==========================================
  {
    name: 'Minimalist Monochrome Matte Quartz Watch',
    description: 'Subtle slate dial with sapphire glass crystal, Swiss Ronda movement, and 50M water resistance.',
    price: 11999,
    category: 'Timepieces',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Tarun Mathur', rating: 5, review: 'The clean matte dial is refined and understated.' },
      { reviewerName: 'Zoya Khan', rating: 5, review: 'Light on the wrist with exceptional dial legibility.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Classic Sapphire Marine Chronometer',
    description: 'Enamel maritime deck dial with blued steel hands, small seconds subdial, and hand-finished mechanical caliber.',
    price: 32999,
    category: 'Timepieces',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Vikramaditya Roy', rating: 5, review: 'Horological art. The blued hands catch light beautifully.' },
      { reviewerName: 'Deepak Chopra', rating: 5, review: 'Pristine marine deck aesthetic with remarkable timing precision.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Skeleton Dial Mechanical Automatic Watch',
    description: 'Open-worked exhibition dial displaying balance wheel escapement through anti-reflective double sapphire crystals.',
    price: 27999,
    category: 'Timepieces',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Amanpreet Singh', rating: 5, review: 'Fascinating to watch the gear train in motion throughout the day.' },
      { reviewerName: 'Bhavna Menon', rating: 4, review: 'Exquisite finishing on the bridge chamfers.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Brushed Bronze Heritage Diver 200M',
    description: 'CuSn8 marine bronze case that develops unique individual patina, uni-directional ceramic bezel, and screw-down crown.',
    price: 29999,
    category: 'Timepieces',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Pranav Nair', rating: 5, review: 'The patina development within two weeks is gorgeous.' },
      { reviewerName: 'Girish Rawat', rating: 5, review: 'Rock solid diver with luminous hands that glow all night.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Racing Tachymeter Stainless Steel Chrono',
    description: 'Triple subdial chronograph with high-frequency quartz movement, ceramic tachymeter bezel, and racing rally strap.',
    price: 18999,
    category: 'Timepieces',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rishi Bakshi', rating: 5, review: 'Crisp tactile pusher action and motorsport heritage feel.' },
      { reviewerName: 'Kavita Joshi', rating: 4, review: 'Eye-catching contrast between sub-dials and the dial plate.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Ultra-Thin Dress Watch with Mesh Strap',
    description: '6.2mm ultra-slim profile in 316L stainless steel, Milanese magnetic mesh strap, and minimalist Roman indices.',
    price: 14499,
    category: 'Timepieces',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Siddharth Jain', rating: 5, review: 'Slides seamlessly under tailored shirt cuffs.' },
      { reviewerName: 'Radhika Bose', rating: 5, review: 'Pure elegance. The mesh bracelet adjusts effortlessly.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Solar-Powered Military Tactical Field Watch',
    description: 'Solar charging cell providing 6-month power reserve, 100M water resistance, and high-tensile olive NATO strap.',
    price: 13999,
    category: 'Timepieces',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Colonel Sandhu', rating: 5, review: 'Unbreakable field watch. Recharges under any ambient light.' },
      { reviewerName: 'Manish Tyagi', rating: 5, review: 'Clear 24-hour military dial markings and scratch resistant crystal.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Dual-Time GMT Pilot Automatic Watch',
    description: 'Independent 24-hour GMT hand with bi-color 24-click ceramic bezel for tracking dual global time zones.',
    price: 34999,
    category: 'Timepieces',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1619134778706-7015533a6150?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Captain Aniket Paul', rating: 5, review: 'Flawless GMT complication for cross-continental travel.' },
      { reviewerName: 'Kunal Grover', rating: 5, review: 'Solid link bracelet with on-the-fly micro-adjust clasp.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Rose Gold Milanese Mesh Slim Watch',
    description: 'Warm rose gold PVD case paired with a sunray champagne dial and scratch-resistant curved mineral glass.',
    price: 12499,
    category: 'Timepieces',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sneha Agarwal', rating: 5, review: 'Refined rose gold hue that looks exceptional at evening events.' },
      { reviewerName: 'Varun Khurana', rating: 4, review: 'Lightweight and very comfortable on the wrist.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Ceramic Bezel Cushion-Case Dive Watch',
    description: 'Vintage 1970s cushion-case profile in 316L steel with helium escape valve and 300M certified water depth.',
    price: 26999,
    category: 'Timepieces',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Ashok Nambiar', rating: 5, review: 'The cushion case ergonomics sit securely on the wrist.' },
      { reviewerName: 'Jatin Chawla', rating: 5, review: 'Super-LumiNova BGW9 brightness is brilliant under water.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Bauhaus Sub-Seconds Enamel Dial Watch',
    description: 'Crisp typographical dial layout inspired by Weimar modernism with heat-tempered blued hands and calf leather.',
    price: 19499,
    category: 'Timepieces',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547996160-01ff67ab7427?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Nikhil Sethi', rating: 5, review: 'Pure geometric balance. Minimalist design at its peak.' },
      { reviewerName: 'Pratibha Das', rating: 5, review: 'Subtle and timeless everyday horology piece.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Regatta Yacht Timer Chronograph Watch',
    description: '10-minute regatta countdown timer with high-contrast colored disk indicators and 200M screw-lock crown.',
    price: 23999,
    category: 'Timepieces',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Ramanathan Iyer', rating: 5, review: 'Crisp countdown functionality and high-contrast sailing dial.' },
      { reviewerName: 'Gaurav Kalia', rating: 4, review: 'Sturdy rubber strap withstands saltwater exposure.' }
    ],
    avgRating: 4.5
  },

  // ==========================================
  // APPAREL (14 Products)
  // ==========================================
  {
    name: 'Heavyweight Pima Cotton Oversized Tee',
    description: '280 GSM long-staple Peruvian pima cotton with drop-shoulder silhouette and reinforced ribbed crewneck collar.',
    price: 2999,
    category: 'Apparel',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Kunal Malhotra', rating: 5, review: 'Heavy, luxurious drape that holds its shape wash after wash.' },
      { reviewerName: 'Ayesha Merchant', rating: 5, review: 'Softest heavyweight t-shirt in my wardrobe.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Water-Repellent Technical Trench Coat',
    description: 'Breathable 3-layer laminated shell fabric with sealed seams, storm flap, and storm collar latch.',
    price: 18999,
    category: 'Apparel',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Harish Nanda', rating: 5, review: 'Blocks heavy monsoon downpours while remaining perfectly breathable.' },
      { reviewerName: 'Priya Chari', rating: 5, review: 'Tailored architectural drape that looks sharp over suits.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Structured Heavyweight Wool Overshirt',
    description: '450 GSM recycled melton wool blend with horn buttons, dual chest flap pockets, and satin shoulder lining.',
    price: 12499,
    category: 'Apparel',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Manav Kaushik', rating: 5, review: 'Substantial warmth and works as a jacket for crisp autumn evenings.' },
      { reviewerName: 'Ritu Vats', rating: 4, review: 'Classic textured wool weave and robust horn buttons.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Japanese Indigo Selvedge Denim Overshirt',
    description: '13.5 oz Kurabo Mills shuttle-loom selvedge denim with selvedge ID on inner placket and raw copper snaps.',
    price: 11999,
    category: 'Apparel',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Varun Somani', rating: 5, review: 'Stiff raw denim with high fading potential. Masterclass weaving.' },
      { reviewerName: 'Akash Narang', rating: 5, review: 'The redline selvedge detail on the placket is pure heritage.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Seamless Merino Wool Base Layer Top',
    description: '100% Australian 18.5 micron merino wool engineered for thermoregulation, natural odor resistance, and stretch.',
    price: 5999,
    category: 'Apparel',
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Mohit Bansal', rating: 5, review: 'No itch at all. Kept me warm on Himalayan alpine trails.' },
      { reviewerName: 'Shalini Ray', rating: 5, review: 'Regulates body temperature remarkably well indoors and outdoors.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Relaxed Pleated Tailored Chino Trousers',
    description: 'Single reverse pleat trousers crafted from Japanese cotton twill with interior curtain waistband.',
    price: 6499,
    category: 'Apparel',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Chetan Bhagwat', rating: 5, review: 'Impeccable drape through the thigh down to a clean slight taper.' },
      { reviewerName: 'Pooja Anand', rating: 4, review: 'Substantial twill that does not crease easily.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Lightweight Packable Windbreaker Anorak',
    description: 'Ripstop nylon shell with DWR finish, half-zip neck gusset, kangaroo front pouch, and self-stowing pocket.',
    price: 7499,
    category: 'Apparel',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Aditya Singhal', rating: 5, review: 'Packs down smaller than a water bottle. Ideal for city cycling.' },
      { reviewerName: 'Nandini Das', rating: 4, review: 'Blocks gale winds completely without trapping humidity.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Brushed Cotton Flannel Button-Down Shirt',
    description: 'Double-brushed Portuguese flannel featuring custom yarn-dyed plaid, mother-of-pearl buttons, and box pleat.',
    price: 4999,
    category: 'Apparel',
    stock: 36,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Deepak Vohra', rating: 5, review: 'Incredibly cozy flannel with substantial weight and zero shrinkage.' },
      { reviewerName: 'Sanjay Nair', rating: 5, review: 'The brushed finish feels velvety soft against the skin.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Organic French Terry Crewneck Sweatshirt',
    description: '400 GSM loopback organic cotton fleece with flatlock stitching throughout and ribbed side gusset panels.',
    price: 5499,
    category: 'Apparel',
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sameer Puri', rating: 5, review: 'Built like vintage athletic gear from the 1960s. High durability.' },
      { reviewerName: 'Neelam Roy', rating: 4, review: 'Comfortable loopback interior that breathes well.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Insulated Technical Primaloft Vest',
    description: 'Ultralight baffle construction stuffed with Primaloft Gold insulation, YKK two-way zipper, and microfleece collar.',
    price: 9499,
    category: 'Apparel',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rohit Balan', rating: 5, review: 'Excellent core warmth with no arm restriction when working.' },
      { reviewerName: 'Anandita Ghosh', rating: 5, review: 'Fits cleanly under coats and over flannels alike.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Corduroy Relaxed Utility Overshirt',
    description: '8-wale thick corduroy jacket with dual patch utility pockets, vintage metal shank buttons, and straight hem.',
    price: 6999,
    category: 'Apparel',
    stock: 26,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Girish Pillai', rating: 5, review: 'Chunky cord texture that looks distinct and rugged.' },
      { reviewerName: 'Simran Bajaj', rating: 4, review: 'Warm earthy color tone with great layerability.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Tactical Ripstop Cargo Trousers',
    description: 'Reinforced cross-weave ripstop fabric with articulated knees, gusseted crotch, and low-profile magnetic cargo pockets.',
    price: 6499,
    category: 'Apparel',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Abhishek Pandey', rating: 5, review: 'Cargo pockets lie completely flat when empty. Great engineering.' },
      { reviewerName: 'Devika Menon', rating: 5, review: 'Extremely durable fabric that repels scrapes and branches.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Double-Breasted Wool Blend Peacoat',
    description: 'Tailored naval peacoat crafted from 32 oz heavy wool with anchor horn buttons and convertible storm lapels.',
    price: 21999,
    category: 'Apparel',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Siddhant Kapoor', rating: 5, review: 'Immaculate military cut and impenetrable wind resistance.' },
      { reviewerName: 'Meghna Sood', rating: 5, review: 'A true heirloom winter coat that will last decades.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Quick-Dry High-Gauge Performance Polo',
    description: 'Technical micro-pique stretch knit with bonded seamless collar, concealed snap placket, and anti-odor finish.',
    price: 3999,
    category: 'Apparel',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Karthik Raja', rating: 5, review: 'Keeps you completely dry in 35-degree heat. Collar never curls.' },
      { reviewerName: 'Priya Sundaram', rating: 4, review: 'Smart minimalist styling suitable for office and golf course.' }
    ],
    avgRating: 4.5
  },

  // ==========================================
  // FOOTWEAR (12 Products)
  // ==========================================
  {
    name: 'Hand-Burnished Calfskin Oxford Dress Shoes',
    description: 'Full-grain French calfskin with closed lacing, Goodyear welted oak bark leather outsole, and hand-stained burnish.',
    price: 19999,
    category: 'Footwear',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Vikram Lal', rating: 5, review: 'Museum-grade leather finishing and comfortable cork footbed.' },
      { reviewerName: 'Rohan Deshpande', rating: 5, review: 'Superb formal shoe that draws compliments in every boardroom.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Rugged Lug-Sole Commando Combat Boots',
    description: 'Chromexcel pull-up leather upper with storm welt construction and heavy Vibram commando lug tread.',
    price: 22999,
    category: 'Footwear',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Kunal Chadha', rating: 5, review: 'Indestructible boots. The leather breaks in like butter.' },
      { reviewerName: 'Amit Singhal', rating: 5, review: 'Incredible traction on muddy wet stone.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Retro Gumsole Suede Skate Sneakers',
    description: 'High-grade hairy suede with vulcanized natural gum rubber outsole and shock-absorbing polyurethane insole.',
    price: 6499,
    category: 'Footwear',
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Arnav Tandon', rating: 5, review: 'Great board feel and classic low-profile aesthetic.' },
      { reviewerName: 'Ria Mathur', rating: 4, review: 'Supple suede and gum sole color is spot on.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Italian Nappa Leather Slip-On Loafers',
    description: 'Buttery soft Italian nappa leather with Blake-stitch construction and cushioned memory-foam leather footbed.',
    price: 15999,
    category: 'Footwear',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Harsh Vardhan', rating: 5, review: 'Zero break-in required. Fits like a glove right out of the box.' },
      { reviewerName: 'Anil Saxena', rating: 5, review: 'Understated Italian luxury with supreme foot comfort.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Minimalist Canvas High-Top Vulcanized Sneakers',
    description: '14 oz heavy duck canvas with reinforced rubber toe cap, nickel eyelets, and orthotic arch support insert.',
    price: 4499,
    category: 'Footwear',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Devendra Joshi', rating: 4, review: 'Sturdy canvas and much more arch support than typical high-tops.' },
      { reviewerName: 'Maya Sen', rating: 5, review: 'Crisp silhouette that pairs cleanly with cropped trousers.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Waterproof Gore-Tex Trail Hiking Boots',
    description: 'Full Gore-Tex membrane bootie with protective TPU toe bumper, EVA midsole damping, and Vibram Megagrip.',
    price: 17499,
    category: 'Footwear',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512990414788-d97cb4923178?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Tenzing Sherpa', rating: 5, review: 'Crossed mountain streams with completely dry feet. Best grip.' },
      { reviewerName: 'Gaurav Bisht', rating: 5, review: 'Zero heel slippage and supreme ankle support under heavy loads.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Hand-Stitched Leather Boat Deck Shoes',
    description: 'Oil-tanned water-resistant pull-up leather with 360-degree raw hide lacing and non-marking siped rubber sole.',
    price: 8999,
    category: 'Footwear',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Vivek Merchant', rating: 5, review: 'Timeless deck shoe architecture that molds to your feet.' },
      { reviewerName: 'Sanjay Dutt', rating: 4, review: 'Grips wet boat decks securely without squeaking.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Lightweight Breathable Knit City Trainers',
    description: 'Engineered single-piece jacquard knit upper with responsive nitrogen-infused foam midsole and TPU heel clip.',
    price: 7999,
    category: 'Footwear',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Manish Bhat', rating: 5, review: 'Feels like walking on clouds during 15,000 step city days.' },
      { reviewerName: 'Kritika Roy', rating: 4, review: 'Airy knit allows full airflow during summer commutes.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Vibram Sole Heritage Work Moc-Toe Boots',
    description: 'Triple-stitched oiled roughout leather with Puritan stitch moc-toe, Goodyear welt, and wedge crepe sole.',
    price: 21499,
    category: 'Footwear',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Jaspreet Gill', rating: 5, review: 'Tough as nails. Resolable construction built to last a lifetime.' },
      { reviewerName: 'Dinesh Seth', rating: 5, review: 'Iconic moc-toe profile with very plush underfoot cushioning.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Suede Penny Loafers with Crepe Sole',
    description: 'Fine English reverse calf suede with traditional saddle cutout strap and natural plantation crepe runner sole.',
    price: 13999,
    category: 'Footwear',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Aditya Singhania', rating: 5, review: 'Casual sophistication at its finest. Crepe sole absorbs all impact.' },
      { reviewerName: 'Priya Mehra', rating: 4, review: 'Rich snuff suede color that pairs with linen trousers.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Carbon-Infused Marathon Racing Flats',
    description: 'Pebax supercritical foam paired with full-length contoured carbon fiber propulsion plate weighing just 185g.',
    price: 23999,
    category: 'Footwear',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Athletics Coach Verma', rating: 5, review: 'Shaved 4 minutes off my marathon personal best. Incredible pop.' },
      { reviewerName: 'Ravi Teja', rating: 5, review: 'The energy return from the carbon plate is explosive.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Technical Mountain Approach Outdoor Shoes',
    description: 'Sticky Vibram Idrogrip rubber climbing zone at toe with climbing lacing system and rubber rand protection.',
    price: 12999,
    category: 'Footwear',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1512990414788-d97cb4923178?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Suresh Raina', rating: 5, review: 'Scrambles steep granite slabs with unbelievable friction.' },
      { reviewerName: 'Pooja Hegde', rating: 4, review: 'Secure lace-to-toe adjustment locks the forefoot in place.' }
    ],
    avgRating: 4.5
  },

  // ==========================================
  // LEATHER GOODS (12 Products)
  // ==========================================
  {
    name: 'Bridle Leather Minimalist Billfold Wallet',
    description: 'English bridle leather with hand-burnished edges, 6 card slots, cash sleeve, and waxed linen thread stitching.',
    price: 4999,
    category: 'Leather Goods',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Rajat Kapoor', rating: 5, review: 'The bridle leather aroma and burnishing are perfection.' },
      { reviewerName: 'Manish Soni', rating: 5, review: 'Super slim profile that does not bulge front pockets.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Vegetable-Tanned Leather Messenger Bag',
    description: 'Full-grain Tuscan saddle leather with solid brass buckle hardware, padded 15-inch laptop pocket, and strap.',
    price: 24999,
    category: 'Leather Goods',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Advocate V. Sharma', rating: 5, review: 'Heavy, rich leather that stands upright and holds all legal briefs.' },
      { reviewerName: 'Anil Kumble', rating: 5, review: 'Unsurpassed artisanal quality. Brass hardware is heavy duty.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Hand-Sewn Horween Chromexcel Key Fob',
    description: 'Horween Chromexcel leather loop with solid sand-cast brass snap shackle and Japanese split ring.',
    price: 1999,
    category: 'Leather Goods',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Kunal Kohli', rating: 5, review: 'Solid brass snap clips onto belt loops effortlessly.' },
      { reviewerName: 'Deepa Rao', rating: 5, review: 'Chromexcel leather patinas within days of pocket wear.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Full-Grain Leather Passport Travel Organizer',
    description: 'RFID-blocking passport wallet with boarding pass sleeve, dual SIM card slots, and integrated brass pen holder.',
    price: 3999,
    category: 'Leather Goods',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sanjay Dutt', rating: 5, review: 'Travel essential. Holds international currency, passport, and cards.' },
      { reviewerName: 'Tarun Tahiliani', rating: 4, review: 'Rich pebble leather with meticulous perimeter stitching.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Top-Grain Leather Desk Pad Blotter Mat',
    description: '90cm x 45cm natural tanned hide with non-slip suede underside, stitched perimeter, and cable organizer channel.',
    price: 5999,
    category: 'Leather Goods',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Aakash Verma', rating: 5, review: 'Transforms the entire workspace aesthetic. Mouse glides perfectly.' },
      { reviewerName: 'Priya Mehra', rating: 5, review: 'Generous surface area and durable edge burnishing.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Heavy-Duty Tool Roll Leather Organizer',
    description: 'Oil-tanned saddle leather with 10 graduated slots for precision hand tools, flap cover, and buckle tie closure.',
    price: 6499,
    category: 'Leather Goods',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Vikram Batra', rating: 5, review: 'Houses my Japanese chisels securely with zero contact.' },
      { reviewerName: 'Naveen Kumar', rating: 4, review: 'Heavy duty leather that takes workbench grease with character.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Leather Valet Catchall Coin and Key Tray',
    description: 'Brass corner-riveted molded English leather catchall tray designed for daily entryway EDC drop.',
    price: 2499,
    category: 'Leather Goods',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sunil Gavaskar', rating: 5, review: 'Simple, handsome, and keeps watch and keys from scratching furniture.' },
      { reviewerName: 'Rekha Menon', rating: 5, review: 'Brass rivets hold the structured corners firmly.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Compact Leather Zippered Coin Pouch',
    description: 'Glove-tanned leather with Swiss Raccagni metal zipper and internal divider for coins, keys, and folded bills.',
    price: 2199,
    category: 'Leather Goods',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Deepak Joshi', rating: 5, review: 'Silky smooth zipper action. Perfect small pocket organizer.' },
      { reviewerName: 'Simran Walia', rating: 4, review: 'Supple leather with clean tonal stitching.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Brass Buckle Vegetable-Tanned Belt',
    description: '1.5-inch width 10 oz full-grain bridle leather strap with solid sand-cast brass roller buckle and beveled edges.',
    price: 3499,
    category: 'Leather Goods',
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Gaurav Khanna', rating: 5, review: 'Will never stretch or tear. Substantial brass roller buckle.' },
      { reviewerName: 'Mohit Sahni', rating: 5, review: 'Ideal width for heavy selvedge denim and workwear.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Italian Leather Folio Document Case',
    description: 'A4 and 13-inch laptop zip-around portfolio in vegetable-tanned Badalassi Carlo leather with business card sleeves.',
    price: 16999,
    category: 'Leather Goods',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Ritesh Oberoi', rating: 5, review: 'Commanding executive presence in client meetings.' },
      { reviewerName: 'Meenakshi Sundaram', rating: 5, review: 'Leather quality is exquisite. Fits MacBook Air and notebooks.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Leather Padded Camera Neck Sling Strap',
    description: 'Horween leather neck pad lined with soft pigskin suede, split ring lug connectors, and bumper guards.',
    price: 3999,
    category: 'Leather Goods',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Anand Shrestha', rating: 5, review: 'Distributes Leica M camera weight comfortably all day.' },
      { reviewerName: 'Swati Ranganathan', rating: 4, review: 'Leather lugs prevent metal rings from scratching camera body.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Dual-Compartment Leather Travel Watch Roll',
    description: 'Curved wooden frame wrapped in saddle leather with micro-suede pillows to cradle two luxury watches during transit.',
    price: 7999,
    category: 'Leather Goods',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Vivek Oberoi', rating: 5, review: 'Slide-in rails keep watches from colliding. Top notch protection.' },
      { reviewerName: 'Kunal Kapoor', rating: 5, review: 'Fits 44mm dive watches with plenty of clearance.' }
    ],
    avgRating: 5.0
  },

  // ==========================================
  // TECH & EDC (12 Products)
  // ==========================================
  {
    name: 'Aircraft Aluminum Magnetic MagSafe Power Bank',
    description: '10,000 mAh aerospace-grade aluminum casing with strong N52 rare-earth magnets and 20W PD bi-directional USB-C.',
    price: 4999,
    category: 'Tech & EDC',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Karan Virani', rating: 5, review: 'Snaps firmly to phone and the matte aluminum dissipates heat quickly.' },
      { reviewerName: 'Pooja Seth', rating: 5, review: 'Fast charging speeds and slim enough to slip into trouser pocket.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Titanium Key Organizer Carabiner Bar',
    description: 'CNC machined Grade 5 titanium skeleton clip with integrated bottle opener, pry tip, and silent key pivot screw.',
    price: 3299,
    category: 'Tech & EDC',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Abhay Deol', rating: 5, review: 'Eliminated all key jingle. Extremely lightweight and durable.' },
      { reviewerName: 'Sanjay Dutt', rating: 5, review: 'The pry tip and pocket clip are wonderfully functional.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Custom 65% Mechanical Keyboard Aluminum Frame',
    description: 'Gasket-mounted hot-swappable PCB with sound-dampening poron foam, brass weight bar, and south-facing RGB switches.',
    price: 18499,
    category: 'Tech & EDC',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Software Architect Gupta', rating: 5, review: 'Deep marbly acoustics right out of the box. Exceptional weight.' },
      { reviewerName: 'Ritvik Sahay', rating: 5, review: 'CNC anodization is flawless. Best typing experience available.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Braided 240W USB-C Kevlar Charging Cable',
    description: 'DuPont Kevlar reinforced ballistic braided 2-meter cable supporting USB Power Delivery 3.1 and 40 Gbps data transfer.',
    price: 2499,
    category: 'Tech & EDC',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Gaurav Sen', rating: 5, review: 'Fast charges 16-inch MacBook Pro at maximum speed. Heavy duty.' },
      { reviewerName: 'Tanmay Bhat', rating: 4, review: 'Sturdy connector collars prevent fraying.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Portable GaN 100W Fast Charger 3-Port',
    description: 'Gallium Nitride semiconductor technology in a compact folding-plug brick with dual USB-C and USB-A smart power split.',
    price: 4499,
    category: 'Tech & EDC',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Naveen Jindal', rating: 5, review: 'Charges laptop, tablet, and phone concurrently without overheating.' },
      { reviewerName: 'Swati Kaul', rating: 5, review: 'Replaced three bulky chargers in my daily carry bag.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Carbon Fiber Pocket Knife with D2 Blade',
    description: 'Drop-point D2 high-carbon tool steel blade with deep-carry pocket clip, ceramic ball bearing pivot, and liner lock.',
    price: 5499,
    category: 'Tech & EDC',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Vikram Singh', rating: 5, review: 'Razor sharp edge retention and swift snappy flipper action.' },
      { reviewerName: 'Devansh Roy', rating: 4, review: 'Carbon fiber scales are lightweight and provide solid grip.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Solid Billet Aluminum Phone Stand',
    description: 'Beveled solid aluminum stand with cable routing pass-through and silicone micro-suction anti-slip base pads.',
    price: 2799,
    category: 'Tech & EDC',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Prateek Kuhad', rating: 5, review: 'Rock solid on the desk. Perfect angle for FaceTime and notifications.' },
      { reviewerName: 'Ananya Birla', rating: 5, review: 'Minimalist sculpture that complements Apple hardware.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Waterproof Hard Shell Electronics Cable Organizer',
    description: 'Molded EVA exterior with water-sealed zipper, elastic cable retention loops, and mesh zippered power bank pouch.',
    price: 2999,
    category: 'Tech & EDC',
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rajesh Gopinath', rating: 5, review: 'Keeps all dongles, drives, and chargers organized on flights.' },
      { reviewerName: 'Meera Rajput', rating: 4, review: 'Crush-resistant hard shell protects sensitive external SSDs.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'MagSafe Compatible Minimalist Card Stand',
    description: 'Foldable vegan leather phone wallet with adjustable viewing angles in portrait and landscape plus 3 card capacity.',
    price: 2499,
    category: 'Tech & EDC',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Farhan Akhtar', rating: 5, review: 'Snaps on firmly and props phone up seamlessly for video calls.' },
      { reviewerName: 'Dia Mirza', rating: 4, review: 'Sleek profile and easy thumb slide for accessing cards.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Machined Stainless Steel Gyroscopic Spinner',
    description: 'Precision CNC lathe-turned 304 stainless steel with hybrid ceramic R188 bearing for silent spin times exceeding 6 minutes.',
    price: 2999,
    category: 'Tech & EDC',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Siddharth Roy', rating: 5, review: 'Silky smooth silent spin. Unbeatable fidget desk toy.' },
      { reviewerName: 'Nisha Pillai', rating: 5, review: 'Weighted balance and knurled grip are extraordinarily satisfying.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Magnetic Wireless 3-in-1 Charging Station',
    description: 'Weighted zinc-alloy tree charging smartphone, smartwatch, and wireless earbuds concurrently from a single USB-C cable.',
    price: 7999,
    category: 'Tech & EDC',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Rohan Mehra', rating: 5, review: 'Cleans up bedside nightstand completely. Super fast charging.' },
      { reviewerName: 'Sanjana Chawla', rating: 5, review: 'Heavy weighted base prevents tipping when removing the phone.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Precision Screwdriver Set 48-Piece Aluminum Case',
    description: 'S2 alloy steel magnetic bits with push-eject anodized aluminum case for electronics, optics, and watch repair.',
    price: 3499,
    category: 'Tech & EDC',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Engineer Sandeep', rating: 5, review: 'Fits every pentalobe and torx screw on modern tech hardware.' },
      { reviewerName: 'Anil Ambani', rating: 4, review: 'Satisfying spring eject click case mechanism.' }
    ],
    avgRating: 4.5
  },

  // ==========================================
  // HOME & LIVING (14 Products)
  // ==========================================
  {
    name: 'Stoneware Ceramic Coffee Mug Set of 4',
    description: 'Artisanal speckled matte glaze fired at 1280 degrees Celsius with ergonomic thumb rest and heat retention.',
    price: 3499,
    category: 'Home & Living',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Chef Sanjeev Anand', rating: 5, review: 'Substantial tactile feel and preserves coffee warmth exceptionally.' },
      { reviewerName: 'Maya Sarabhai', rating: 5, review: 'Earthy organic glaze colors look gorgeous on open shelving.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Hand-Blown Borosilicate Glass Carafe Set',
    description: 'Thermal shock resistant borosilicate carafe with matching stacking tumbler and precision drip-free pour spout.',
    price: 4299,
    category: 'Home & Living',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Kabir Bedi', rating: 5, review: 'Bedside nightstand perfection. Crystal clear glass quality.' },
      { reviewerName: 'Zeenat Aman', rating: 4, review: 'The stacking glass lid doubles as a water cup cleanly.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Minimalist Terrazzo Concrete Coaster Set',
    description: 'Cast mineral composite terrazzo with brass fleck inclusions, sealed waterproof finish, and cork backing.',
    price: 1999,
    category: 'Home & Living',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Gauri Khan', rating: 5, review: 'Architectural details that protect marble coffee tables reliably.' },
      { reviewerName: 'Akshay Kumar', rating: 5, review: 'Substantial weight so they never stick to the bottom of cold glasses.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Japanese Cast Iron Tetsubin Tea Kettle',
    description: 'Traditional Nanbu iron kettle with food-grade enamel interior, heat-resistant hemp wrapped handle, and stainless infuser.',
    price: 8999,
    category: 'Home & Living',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Tea Sommelier Sen', rating: 5, review: 'Retains heat for over an hour. Brews sencha and oolong to perfection.' },
      { reviewerName: 'Sunita Rao', rating: 5, review: 'Heirloom cast iron quality that will be passed down generations.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Solid Oak Wood Monitor Stand Riser',
    description: 'Continuous grain American white oak platform with cork isolation feet and integrated felt-lined accessory tray.',
    price: 7499,
    category: 'Home & Living',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Designer Pranav', rating: 5, review: 'Elevates monitor to ergonomic eye level while stowing keyboard below.' },
      { reviewerName: 'Juhi Chawla', rating: 5, review: 'Matte oil finish highlights beautiful natural oak wood grain.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Pure French Linen Washed Bedding Duvet Set',
    description: 'Pre-washed 170 GSM Normandy flax linen ensuring breathable cooling in summer and thermal insulation in winter.',
    price: 16999,
    category: 'Home & Living',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1594913785162-e678a0c23ddb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Nandita Das', rating: 5, review: 'Gets softer with every single laundry cycle. Unrivaled sleep comfort.' },
      { reviewerName: 'Arjun Rampal', rating: 5, review: 'Airy natural flax that prevents overheating completely.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Handcrafted Walnut Cutting and Charcuterie Board',
    description: 'End-grain black walnut butcher block with juice groove perimeter, non-slip rubber feet, and beeswax conditioning.',
    price: 6999,
    category: 'Home & Living',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Chef Ranveer', rating: 5, review: 'End-grain fibers self-heal and keep Japanese kitchen knives razor sharp.' },
      { reviewerName: 'Tara Sharma', rating: 5, review: 'Stunning centerpiece for serving artisanal cheeses and tapas.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Sculptural Ceramic Flower Vase Minimalist',
    description: 'Hand-thrown geometric stoneware vase with unglazed textured terracotta exterior and waterproof glazed interior.',
    price: 3999,
    category: 'Home & Living',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Dimple Kapadia', rating: 5, review: 'Looks like a modern gallery sculpture even without dried florals.' },
      { reviewerName: 'Karan Johar', rating: 4, review: 'Subtle warm architectural proportions.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Natural Bristle Beechwood Clothes Grooming Brush',
    description: 'Oiled German beechwood handle with stiff wild boar bristles for gently removing lint and dust from tailored wool.',
    price: 2499,
    category: 'Home & Living',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Bespoke Tailor Mehta', rating: 5, review: 'Revitalizes wool suit fibers far better than sticky tape rollers.' },
      { reviewerName: 'Sushmita Sen', rating: 5, review: 'Solid wood handle fits comfortably in the palm.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Matte Black Stainless Steel French Press',
    description: 'Double-wall vacuum insulated body retaining brewing temperature for 60 minutes with 4-stage micro-mesh filtration.',
    price: 4999,
    category: 'Home & Living',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Barista Vikram', rating: 5, review: 'Zero sediment in the cup and coffee remains steaming hot for second pour.' },
      { reviewerName: 'Kareena Kapoor', rating: 4, review: 'Sleek matte black finish that does not show water spots.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Heavyweight Cotton Waffle Weave Bath Towel Set',
    description: '600 GSM zero-twist Turkish Aegean cotton waffle structure engineered for rapid absorption and fast drying.',
    price: 4499,
    category: 'Home & Living',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594913785162-e678a0c23ddb?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Sharmila Tagore', rating: 5, review: 'Spa quality texture that exfoliates gently and dries twice as fast.' },
      { reviewerName: 'Saif Ali Khan', rating: 5, review: 'Plush waffle pockets expand after first wash. Highly absorbent.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Hand-Carved Acacia Wood Serving Bowl',
    description: 'Turned from a single solid block of sustainably harvested acacia hardwood, treated with food-grade walnut oil.',
    price: 3699,
    category: 'Home & Living',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Madhuri Dixit', rating: 5, review: 'Rich swirls of natural wood grain. Perfect for fresh garden salads.' },
      { reviewerName: 'Anupam Kher', rating: 4, review: 'Lightweight yet very sturdy solid hardwood construction.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Architectural Concrete Incense Burner Plate',
    description: 'Cast architectural concrete tray with solid brass sphere incense stick holder and ash containment rim.',
    price: 2199,
    category: 'Home & Living',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Mira Rajput', rating: 5, review: 'Catches all falling ash completely. Beautiful brutalist accent.' },
      { reviewerName: 'Shahid Kapoor', rating: 5, review: 'Brass sphere holds both thin Japanese and Indian agarbatti sticks.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Precision Digital Kitchen Coffee Scale',
    description: '0.1g accuracy strain-gauge sensor with integrated espresso shot timer, silicone heat pad, and USB-C recharging.',
    price: 3899,
    category: 'Home & Living',
    stock: 26,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Roaster Abhinav', rating: 5, review: 'Instantaneous response time. Fits neatly on espresso drip trays.' },
      { reviewerName: 'Kriti Sanon', rating: 4, review: 'Auto-timer function makes pour-over recipes repeatable.' }
    ],
    avgRating: 4.5
  },

  // ==========================================
  // EYEWEAR (12 Products)
  // ==========================================
  {
    name: 'Classic Tortoiseshell Acetate Sunglasses',
    description: 'Cured Italian Mazzucchelli acetate with 7-barrel riveted hinges, green CR-39 UV400 lenses, and wirecore temples.',
    price: 8999,
    category: 'Eyewear',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Ranbir Kapoor', rating: 5, review: 'Heft and balance of the acetate frames are second to none.' },
      { reviewerName: 'Alia Bhatt', rating: 5, review: 'Rich amber tortoiseshell mottling that suits any facial profile.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Matte Black Aviator Polarized Sunglasses',
    description: 'Ultra-lightweight surgical stainless steel frame with sweat-resistant silicone brow bar and polarized TAC lenses.',
    price: 9499,
    category: 'Eyewear',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Pilot R. Malhotra', rating: 5, review: 'Cuts roadway and cockpit glare completely with crystal clarity.' },
      { reviewerName: 'Hrithik Roshan', rating: 5, review: 'Stays comfortably anchored during sports and outdoor driving.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Japanese Titanium Hexagonal Optical Frames',
    description: 'Fukui-crafted beta titanium weighing only 11 grams with coin-edge rim engravings and hypoallergenic nose pads.',
    price: 14999,
    category: 'Eyewear',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509695503492-4133400a451b?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Architect Somnath', rating: 5, review: 'You genuinely forget you are wearing glasses. Featherweight.' },
      { reviewerName: 'Konkona Sen', rating: 5, review: 'The subtle hexagonal geometry adds unique intellectual character.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Vintage Round Horn-Rimmed Prescription Glasses',
    description: 'Keyhole bridge design crafted from custom layered cellulose acetate with German OBE safety stop hinges.',
    price: 7999,
    category: 'Eyewear',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Dr. Mukhopadhyay', rating: 5, review: 'Timeless mid-century academia look with pristine finishing.' },
      { reviewerName: 'Vidya Balan', rating: 4, review: 'The keyhole bridge eliminates any pressure on the nasal bone.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Square Polarized UV400 Driving Sunglasses',
    description: 'Impact-resistant polycarbonate frames with copper driving tint lenses optimized for road glare reduction.',
    price: 6499,
    category: 'Eyewear',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Rally Driver Joshi', rating: 5, review: 'Contrast enhancement in hazy sunlit conditions is remarkable.' },
      { reviewerName: 'John Abraham', rating: 4, review: 'Comfortable rubberized temples prevent slipping under helmets.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Minimalist Rimless Featherweight Eyeglasses',
    description: 'Three-piece rimless drill mount in aerospace titanium with flexible memory temples and anti-reflective demo lenses.',
    price: 12999,
    category: 'Eyewear',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1509695503492-4133400a451b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Justice K. Chandrachud', rating: 5, review: 'Unobstructed panoramic vision without heavy frames in view.' },
      { reviewerName: 'Naseeruddin Shah', rating: 5, review: 'Titanium compression fittings hold prescription lenses rock solid.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Handcrafted Mazzucchelli Acetate Wayfarers',
    description: 'Beveled 10mm slab acetate front with custom guilloche core wire, mineral glass polarized lenses, and riveted joints.',
    price: 11499,
    category: 'Eyewear',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: true,
    ratings: [
      { reviewerName: 'Abhay Chopra', rating: 5, review: 'Substantial chunky frame with exquisite hand-polished bevels.' },
      { reviewerName: 'Anil Kapoor', rating: 5, review: 'Iconic profile that turns heads everywhere.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Amber Tint Polarized Metal Pilot Sunglasses',
    description: 'Double bridge pilot frame with amber mineral glass lenses, soldered teardrop eye-wires, and bayonet temples.',
    price: 10499,
    category: 'Eyewear',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1582142839970-2b971eac81a1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Navin Chawla', rating: 5, review: 'Bayonet temples slide under hats and headphones with ease.' },
      { reviewerName: 'Bipasha Basu', rating: 4, review: 'Warm sunset tint makes overcast monsoon afternoons vibrant.' }
    ],
    avgRating: 4.5
  },
  {
    name: 'Blue Light Filtering Transparent Optical Frames',
    description: 'Crystal clear biological acetate with blue light absorbing monomer lenses and OBE spring-loaded hinges.',
    price: 5999,
    category: 'Eyewear',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Frontend Lead Rohan', rating: 5, review: 'Completely eliminated eye fatigue during 12-hour code sprints.' },
      { reviewerName: 'Tanvi Madan', rating: 5, review: 'Crystal frame looks fresh and matches every outfit.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Retro Cat-Eye Bold Acetate Sunglasses',
    description: 'Dramatic upswept cat-eye angles in deep obsidian black acetate with gradient smoke nylon lenses and gold pins.',
    price: 8499,
    category: 'Eyewear',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Deepika Padukone', rating: 5, review: 'Bold cinematic silhouette. Outstanding sun protection.' },
      { reviewerName: 'Sonam Kapoor', rating: 5, review: 'High fashion drama with comfortable balanced temples.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Brushed Gold Wire-Frame Round Spectacles',
    description: 'Vintage 1920s round silhouette in 24k brushed gold IP plated monel metal with filigree nose bridge detailing.',
    price: 9999,
    category: 'Eyewear',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1509695503492-4133400a451b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582142839970-2b971eac81a1?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Javed Akhtar', rating: 5, review: 'Poetic, literary aesthetic. The gold plating is warm and durable.' },
      { reviewerName: 'Shabana Azmi', rating: 5, review: 'Exquisite filigree engraving along the lens rims.' }
    ],
    avgRating: 5.0
  },
  {
    name: 'Polarized Gradient Sport Shield Sunglasses',
    description: 'Frameless aerodynamic cylindrical shield lens with hydro-oleophobic coating and adjustable megol rubber nose bridge.',
    price: 8999,
    category: 'Eyewear',
    stock: 26,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80'
    ],
    isFeatured: false,
    ratings: [
      { reviewerName: 'Triathlete Varun', rating: 5, review: 'Zero fogging on high-humidity rides. Panoramic peripheral field.' },
      { reviewerName: 'Mithali Raj', rating: 4, review: 'Extremely lightweight and stays fixed even when sprinting.' }
    ],
    avgRating: 4.5
  }
];

async function seed100Products() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    console.log(`Starting insertion of ${products.length} products...`);
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of products) {
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
    console.log(`Finished processing: Added ${addedCount}, Updated ${updatedCount}.`);
    console.log(`Total products in catalog: ${totalCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed100Products();
