/**
 * checkout.js — Stripe checkout flow
 * 1. Load cart summary
 * 2. Create PaymentIntent via /api/payment/create-intent
 * 3. Mount Stripe card element
 * 4. On submit: confirm payment → create order → redirect to success
 */

const STRIPE_PK = 'pk_test_your_stripe_publishable_key'; // Replace with your actual publishable key

let stripe     = null;
let cardElement = null;
let paymentIntentId = null;

const checkoutForm   = document.getElementById('checkout-form');
const orderSummaryEl = document.getElementById('order-summary-items');
const summaryTotal   = document.getElementById('summary-total');
const cardErrors     = document.getElementById('card-errors');
const payBtn         = document.getElementById('pay-btn');
const successSection = document.getElementById('checkout-success');
const formSection    = document.getElementById('checkout-form-section');

/**
 * Load and display cart items in the sidebar.
 */
function loadOrderSummary() {
  const cart = getCart();

  if (cart.length === 0) {
    // Redirect to cart if empty
    window.location.href = '/cart.html';
    return;
  }

  if (orderSummaryEl) {
    orderSummaryEl.innerHTML = cart.map((item) => `
      <div class="summary-row">
        <span>${item.name} <span class="text-muted">×${item.qty}</span></span>
        <span>${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('');
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (summaryTotal) summaryTotal.textContent = formatPrice(total);

  // Show shipping line
  const shippingEl = document.getElementById('summary-shipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

  const subtotalEl = document.getElementById('summary-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  return Math.round(total * 100); // Return total in cents for Stripe
}

/**
 * Initialize Stripe and mount the card element.
 */
async function initStripe(amountCents) {
  try {
    stripe = Stripe(STRIPE_PK);

    // Create payment intent
    const data = await api.post('/payment/create-intent', {
      amount: amountCents,
      currency: 'usd',
    });

    paymentIntentId = data.paymentIntentId;

    const elements = stripe.elements({
      clientSecret: data.clientSecret,
    });

    cardElement = elements.create('card', {
      style: {
        base: {
          color: '#333',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: '16px',
          '::placeholder': { color: '#bbb' },
        },
        invalid: { color: '#dc3545' },
      },
    });

    cardElement.mount('#card-element');

    cardElement.on('focus', () => {
      document.getElementById('card-element').classList.add('focused');
    });
    cardElement.on('blur', () => {
      document.getElementById('card-element').classList.remove('focused');
    });
    cardElement.on('change', (event) => {
      if (cardErrors) {
        cardErrors.textContent = event.error ? event.error.message : '';
      }
    });

    if (payBtn) payBtn.disabled = false;
  } catch (err) {
    if (cardErrors) {
      cardErrors.textContent = `Failed to initialize payment: ${err.message}`;
    }
    console.error('Stripe init error:', err);
  }
}

/**
 * Collect shipping form data.
 */
function getShippingAddress() {
  return {
    street:  document.getElementById('street')?.value?.trim()  || '',
    city:    document.getElementById('city')?.value?.trim()    || '',
    state:   document.getElementById('state')?.value?.trim()   || '',
    zip:     document.getElementById('zip')?.value?.trim()     || '',
    country: document.getElementById('country')?.value?.trim() || '',
  };
}

/**
 * Validate the shipping form.
 * @returns {boolean}
 */
function validateShipping() {
  const fields = ['street', 'city', 'state', 'zip', 'country'];
  let valid = true;
  fields.forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    if (el && !el.value.trim()) {
      el.classList.add('is-invalid');
      valid = false;
    } else if (el) {
      el.classList.remove('is-invalid');
    }
  });
  if (!valid) showToast('Please fill in all shipping fields', 'warning');
  return valid;
}

/**
 * Handle payment form submission.
 */
async function handlePayment(e) {
  e.preventDefault();

  if (!validateShipping()) return;
  if (!stripe || !cardElement) {
    showToast('Payment system not ready. Please wait.', 'warning');
    return;
  }

  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner spinner-sm"></span> Processing payment…';
  if (cardErrors) cardErrors.textContent = '';

  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(undefined, {
      payment_method: { card: cardElement },
    });

    if (error) {
      if (cardErrors) cardErrors.textContent = error.message;
      showToast(error.message, 'error');
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      await createOrder();
    }
  } catch (err) {
    if (cardErrors) cardErrors.textContent = err.message;
    showToast('Payment failed: ' + err.message, 'error');
    payBtn.disabled = false;
    payBtn.textContent = 'Pay Now';
  }
}

/**
 * Create order in the backend after successful payment.
 */
async function createOrder() {
  const cart = getCart();
  const shippingAddress = getShippingAddress();

  const items = cart.map((item) => ({
    product: item._id,
    qty: item.qty,
  }));

  try {
    await api.post('/orders', {
      items,
      shippingAddress,
      paymentIntentId,
    });

    // Clear cart
    clearCart();

    // Show success
    if (formSection) formSection.classList.add('hidden');
    if (successSection) successSection.classList.remove('hidden');

    showToast('Order placed successfully! 🎉', 'success');
  } catch (err) {
    // Payment went through but order creation failed
    showToast('Payment received, but order creation failed. Contact support.', 'warning');
    console.error('Order creation error:', err);
  }
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Protect checkout page — must be logged in
  if (!getToken || !getToken()) {
    window.location.href = '/login.html?redirect=/checkout.html';
    return;
  }

  const amountCents = loadOrderSummary();
  if (amountCents) {
    await initStripe(amountCents);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handlePayment);
  }

  // Pre-fill address from profile if available
  try {
    const profileData = await api.get('/auth/profile');
    const addr = profileData.user && profileData.user.address;
    if (addr) {
      const fieldMap = { street: 'street', city: 'city', state: 'state', zip: 'zip', country: 'country' };
      Object.entries(fieldMap).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el && addr[key]) el.value = addr[key];
      });
    }
  } catch {
    // Not logged in or no address — fine
  }
});
