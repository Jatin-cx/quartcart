# ShopEase — E-Commerce Store

A production-quality e-commerce website built with **Node.js**, **Express**, **MongoDB**, **Stripe**, and vanilla HTML/CSS/JS frontend.

## Features

- 🛒 Full shopping cart (localStorage)
- 🔐 JWT authentication (register / login)
- 💳 Stripe payment integration
- 📦 Order management
- 🔍 Product search, filter, sort
- 📱 Fully responsive design

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Stripe account (for payment keys)

---

## Quick Start

### 1. Clone / Download the project

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-store
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
CLIENT_URL=http://localhost:5000
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5000**

### 5. Seed sample products (optional)

You can POST to `/api/products` to create products for testing:

```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling wireless headphones.",
  "price": 79.99,
  "category": "Electronics",
  "stock": 50,
  "images": ["https://via.placeholder.com/400x400?text=Headphones"],
  "isFeatured": true
}
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, returns JWT |
| GET | /api/auth/profile | ✅ | Get current user |
| PUT | /api/auth/profile | ✅ | Update profile |
| GET | /api/products | ❌ | List all products |
| GET | /api/products/featured | ❌ | Featured products |
| GET | /api/products/:id | ❌ | Single product |
| POST | /api/products | ❌ | Create product (admin) |
| PUT | /api/products/:id | ❌ | Update product |
| DELETE | /api/products/:id | ❌ | Delete product |
| POST | /api/orders | ✅ | Place an order |
| GET | /api/orders/my | ✅ | My orders |
| GET | /api/orders/:id | ✅ | Single order |
| POST | /api/payment/create-intent | ❌ | Create Stripe PaymentIntent |
| POST | /api/payment/webhook | ❌ | Stripe webhook |

---

## Tech Stack

**Backend:** Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, Stripe, Helmet, express-rate-limit  
**Frontend:** Vanilla HTML5, CSS3 (custom properties, CSS Grid/Flexbox), Vanilla JavaScript (ES6+)  
**Database:** MongoDB  
**Payments:** Stripe

---

## Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT expires in 7 days
- Rate limiting on auth routes (20 req/15min)
- Helmet.js for security headers
- CORS restricted to CLIENT_URL

---

## License

MIT
