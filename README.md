# QuickCart - Full-Stack 3D E-Commerce Platform

A complete, production-ready full-stack e-commerce web application built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Three.js (WebGL 3D)**, **JWT Authentication & Role-Based Authorization**, and **Stripe Payments**.

---

## Key Features

- **Interactive 3D Retail Showroom (Three.js / WebGL):**
  - Full-viewport 3D floating shopping bags, wrapped gift boxes, and orbiting gold rings (`public/js/bg-3d.js`).
  - Interactive 360-degree 3D Studio Product Turntable with real-time colorway switching (`public/js/three-hero.js`).
  - 3D Luxury Shopping Pedestal on Sign In & Sign Up pages (`public/js/three-shopping-auth.js`).
  - Interactive 3D Card Tilt & Specular Glare physics across product cards (`public/js/tilt3d.js`).
  - Interactive 3D 404 Not Found page (`public/404.html`).
- **Secured Owner & Admin Control Center (`/admin.html`):**
  - Protected by JWT Authentication (`authMiddleware`) and Admin Role Authorization (`requireAdmin`).
  - Add, edit, delete products, adjust inventory stock (`+5` / `-1`), toggle homepage spotlight, or 1-click seed 6 flagship products.
  - **Live Site & Theme Customizer:** Change store name, switch between 5 color palettes live, toggle 3D background, edit homepage headlines, and update store policies directly from the browser.
  - Manage customer orders (payment status & fulfillment status) and user accounts/roles.
- **Full Customer Storefront Experience:**
  - Product catalog with live search, category filtering, and price/date sorting.
  - Slide-out Shopping Bag Drawer + full Shopping Bag page (`cart.html`).
  - Checkout workflow with promo code support (`QUICK3D`) and Stripe payment integration.
  - Customer registration, login, password reset, profile management, and order history.

---

## Quick Start Guide (For College Project Setup)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas URI)

### 2. Install Dependencies
Open a terminal in the project folder and run:

```bash
npm install
```

### 3. Configure Environment Variables
Make sure a `.env` file exists in the root directory (or copy `.env.example` to `.env`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopease
JWT_SECRET=quickcart_super_secret_jwt_key_2026
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
CLIENT_URL=http://localhost:5000
```

### 4. Seed Sample Products (Optional)
You can seed the 6 flagship 3D products from the terminal or via the Admin Dashboard button:

```bash
node seed.js
```

### 5. Start the Server

```bash
npm start
```

- **Storefront URL:** http://localhost:5000
- **Admin Control Center URL:** http://localhost:5000/admin.html
- **404 Page URL:** http://localhost:5000/404.html

---

## Default Owner / Admin Login Credentials

To unlock the **Admin Control Center** at `http://localhost:5000/admin.html`:
- **Email:** `admin@quickcart.com`
- **Password:** `Admin@12345`
- **Owner Master Key (optional):** `QUICKCART-OWNER-2026`
