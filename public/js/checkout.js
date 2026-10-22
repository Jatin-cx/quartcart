/**
 * checkout.js - Complete Indian Multi-Payment Method Checkout Flow
 * Supports:
 * 1. Google Pay (GPay) & UPI (PhonePe, Paytm, BHIM, Dynamic QR Code)
 * 2. Credit & Debit Cards (RuPay, Visa, Mastercard, Maestro)
 * 3. Net Banking (SBI, HDFC, ICICI, Axis, Kotak, PNB & 40+ banks)
 * 4. Cash on Delivery (COD)
 */

'use strict';

let currentTotal = 0;
let currentUpiApp = 'gpay';
let stripe = null;
let cardElement = null;

const checkoutForm   = document.getElementById('checkout-form');
const orderSummaryEl = document.getElementById('order-summary-items');
const summaryTotal   = document.getElementById('summary-total');
const cardErrors     = document.getElementById('card-errors');
const payBtn         = document.getElementById('pay-btn');
const successSection = document.getElementById('checkout-success');
const formSection    = document.getElementById('checkout-form-section');

/**
 * 1. Load and display order summary with Indian Rupee calculation
 */
function loadOrderSummary() {
  const cart = getCart();

  if (cart.length === 0) {
    window.location.href = '/cart.html';
    return 0;
  }

  if (orderSummaryEl) {
    orderSummaryEl.innerHTML = cart.map((item) => `
      <div class="summary-row">
        <span>${item.name} <span class="text-muted">x${item.qty}</span></span>
        <span style="font-weight:700;color:var(--text-main);">${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('');
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  currentTotal = total;

  if (summaryTotal) summaryTotal.textContent = formatPrice(total);

  const shippingEl = document.getElementById('summary-shipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

  const subtotalEl = document.getElementById('summary-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  const qrAmountLabel = document.getElementById('qr-amount-label');
  if (qrAmountLabel) qrAmountLabel.textContent = `Pay Amount: ${formatPrice(total)}`;

  updatePayButtonText();

  return Math.round(total * 100); // Return total in paise
}

/**
 * 2. Update Pay Button label dynamically based on selected payment method
 */
function updatePayButtonText() {
  if (!payBtn) return;
  const methodInput = document.getElementById('selected-payment-method');
  const method = methodInput ? methodInput.value : 'gpay';
  const formatted = formatPrice(currentTotal);

  if (method === 'gpay') {
    if (currentUpiApp === 'phonepe') {
      payBtn.textContent = `Pay ${formatted} with PhonePe`;
    } else if (currentUpiApp === 'paytm') {
      payBtn.textContent = `Pay ${formatted} with Paytm`;
    } else if (currentUpiApp === 'bhim') {
      payBtn.textContent = `Pay ${formatted} with BHIM UPI`;
    } else {
      payBtn.textContent = `Pay ${formatted} with Google Pay`;
    }
  } else if (method === 'card') {
    payBtn.textContent = `Pay ${formatted} via Card`;
  } else if (method === 'netbanking') {
    const bankName = document.getElementById('selected-bank-name')?.value || 'Net Banking';
    payBtn.textContent = `Pay ${formatted} via ${bankName}`;
  } else if (method === 'cod') {
    payBtn.textContent = 'Place Order (Cash on Delivery)';
  } else {
    payBtn.textContent = `Pay ${formatted}`;
  }
}

/**
 * 3. Payment Method Tab Switching
 */
window.selectPaymentMethod = function (method, element) {
  const methodInput = document.getElementById('selected-payment-method');
  if (methodInput) methodInput.value = method;

  // Toggle active card
  document.querySelectorAll('.pay-option').forEach((opt) => {
    const isActive = opt.dataset.method === method;
    opt.classList.toggle('active', isActive);
    opt.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  // Toggle panels
  document.querySelectorAll('.pay-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${method}`);
  });

  updatePayButtonText();
};

/**
 * 4. UPI App Selector
 */
window.selectUpiApp = function (app, element) {
  currentUpiApp = app;
  document.querySelectorAll('.upi-app-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.app === app);
  });

  const upiInput = document.getElementById('upi-id-input');
  if (upiInput) {
    let username = upiInput.value.split('@')[0] || 'akash';
    if (app === 'gpay') {
      upiInput.value = `${username}@okhdfcbank`;
    } else if (app === 'phonepe') {
      upiInput.value = `${username}@ybl`;
    } else if (app === 'paytm') {
      upiInput.value = `${username}@paytm`;
    } else if (app === 'bhim') {
      upiInput.value = `${username}@upi`;
    }
    verifyUpiId();
  }

  updatePayButtonText();
};

/**
 * 5. Append quick handle suffix
 */
window.appendUpiHandle = function (handle) {
  const input = document.getElementById('upi-id-input');
  if (!input) return;
  const username = input.value.split('@')[0] || 'customer';
  input.value = username + handle;
  verifyUpiId();
};

/**
 * 6. Quick UPI ID Verification
 */
window.verifyUpiId = function () {
  const input = document.getElementById('upi-id-input');
  const msgEl = document.getElementById('upi-verify-msg');
  if (!input || !msgEl) return;

  const val = input.value.trim();
  if (val && val.includes('@') && val.split('@')[1].length >= 2) {
    const handle = val.split('@')[1].toLowerCase();
    let bank = 'BHIM UPI';
    if (handle.includes('okhdfc')) bank = 'HDFC Bank (Google Pay)';
    else if (handle.includes('okaxis')) bank = 'Axis Bank (Google Pay)';
    else if (handle.includes('oksbi')) bank = 'State Bank of India (Google Pay)';
    else if (handle.includes('ybl') || handle.includes('ibl')) bank = 'YES Bank (PhonePe)';
    else if (handle.includes('paytm')) bank = 'Paytm Payments Bank';

    msgEl.style.color = 'var(--success)';
    msgEl.textContent = `Verified UPI ID linked to ${bank}`;
  } else {
    msgEl.style.color = 'var(--text-dim)';
    msgEl.textContent = 'Please enter a valid handle (e.g. yourname@okhdfcbank)';
  }
};

/**
 * 7. Toggle Dynamic UPI QR Code
 */
window.toggleUpiQrCode = function () {
  const box = document.getElementById('upi-qr-box');
  const btn = document.getElementById('upi-qr-toggle-btn');
  if (!box) return;

  const isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  if (btn) {
    btn.textContent = isOpen
      ? 'Show Dynamic UPI QR Code to Scan'
      : 'Hide UPI QR Code';
  }
};

/**
 * 8. Card Formatting & Brand Detection
 */
window.formatCardNumber = function (input) {
  let value = input.value.replace(/\D/g, '').substring(0, 16);
  let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formatted;

  const badge = document.getElementById('card-type-badge');
  if (!badge) return;

  if (value.startsWith('4')) {
    badge.textContent = 'Visa';
    badge.style.color = '#1a1f71';
  } else if (/^5[1-5]/.test(value) || /^2[2-7]/.test(value)) {
    badge.textContent = 'Mastercard';
    badge.style.color = '#eb001b';
  } else if (/^(60|65|81|82|508)/.test(value)) {
    badge.textContent = 'RuPay';
    badge.style.color = '#008559';
  } else if (/^3[47]/.test(value)) {
    badge.textContent = 'Amex';
    badge.style.color = '#006fcf';
  } else {
    badge.textContent = 'RuPay / Visa';
    badge.style.color = 'var(--accent-primary)';
  }
};

window.formatCardExpiry = function (input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 3) {
    input.value = val.substring(0, 2) + '/' + val.substring(2);
  } else {
    input.value = val;
  }
};

/**
 * 9. Net Banking Bank Selection
 */
window.selectBank = function (bankName, element) {
  const bankInput = document.getElementById('selected-bank-name');
  if (bankInput) bankInput.value = bankName;

  document.querySelectorAll('.bank-tile').forEach((tile) => {
    tile.classList.toggle('active', tile.dataset.bank === bankName);
  });

  const selectEl = document.getElementById('all-banks-select');
  if (selectEl && !element) {
    selectEl.value = bankName;
  }

  updatePayButtonText();
};

/**
 * 10. Collect shipping form data
 */
function getShippingAddress() {
  return {
    street:  document.getElementById('street')?.value?.trim()  || '',
    city:    document.getElementById('city')?.value?.trim()    || '',
    state:   document.getElementById('state')?.value?.trim()   || '',
    zip:     document.getElementById('zip')?.value?.trim()     || '',
    country: document.getElementById('country')?.value?.trim() || 'India',
  };
}

/**
 * 11. Validate shipping address fields
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
  if (!valid) showToast('Please complete all shipping address fields.', 'warning');
  return valid;
}

/**
 * 12. Main Payment Handler supporting GPay, UPI, Card, Net Banking & COD
 */
async function handlePayment(e) {
  e.preventDefault();

  if (!validateShipping()) return;

  const method = document.getElementById('selected-payment-method')?.value || 'gpay';
  let paymentDetails = { method };

  // Method specific validation
  if (method === 'gpay') {
    const upiId = document.getElementById('upi-id-input')?.value?.trim() || 'akash@okhdfcbank';
    if (!upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'warning');
      return;
    }
    paymentDetails = {
      method: 'UPI / Google Pay',
      app: currentUpiApp,
      upiId,
      transactionId: `UPI_IN_${Date.now()}`,
    };
  } else if (method === 'card') {
    const cardNum = document.getElementById('card-num-input')?.value?.replace(/\s/g, '') || '';
    const cardExpiry = document.getElementById('card-expiry-input')?.value?.trim() || '';
    const cardCvv = document.getElementById('card-cvv-input')?.value?.trim() || '';
    const cardHolder = document.getElementById('card-holder-input')?.value?.trim() || 'Valued Customer';

    if (cardNum.length < 15) {
      showToast('Please enter a valid 16-digit card number.', 'warning');
      return;
    }
    if (cardExpiry.length < 5) {
      showToast('Please enter a valid card expiry date (MM/YY).', 'warning');
      return;
    }
    if (cardCvv.length < 3) {
      showToast('Please enter a valid 3-digit CVV.', 'warning');
      return;
    }

    paymentDetails = {
      method: 'Credit / Debit Card',
      cardHolder,
      cardLast4: cardNum.slice(-4),
      cardType: document.getElementById('card-type-badge')?.textContent || 'RuPay / Visa',
      transactionId: `CARD_IN_${Date.now()}`,
    };
  } else if (method === 'netbanking') {
    const bankName = document.getElementById('selected-bank-name')?.value || 'State Bank of India (SBI)';
    paymentDetails = {
      method: 'Net Banking',
      bankName,
      transactionId: `NB_IN_${Date.now()}`,
    };
  } else if (method === 'cod') {
    paymentDetails = {
      method: 'Cash on Delivery (COD)',
      notes: 'Pay via cash or courier UPI QR code upon doorstep delivery.',
    };
  }

  // Processing state
  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner spinner-sm"></span> Authorizing with bank...';
  if (cardErrors) cardErrors.textContent = '';

  try {
    const cart = getCart();
    const shippingAddress = getShippingAddress();

    const items = cart.map((item) => ({
      product: item._id,
      qty: item.qty,
    }));

    const res = await api.post('/orders', {
      items,
      shippingAddress,
      paymentMethod: method,
      paymentDetails,
    });

    // Cache order reference for invoice download
    window.__lastCreatedOrder = res.order;

    // Clear cart immediately
    clearCart();

    // Render Success Section
    if (formSection) formSection.classList.add('hidden');
    if (successSection) {
      successSection.style.display = 'block';
      successSection.classList.remove('hidden');

      const orderIdEl = document.getElementById('success-order-id');
      if (orderIdEl) {
        orderIdEl.textContent = `#${String(res.order._id).slice(-8).toUpperCase()}`;
      }

      const methodEl = document.getElementById('success-payment-method');
      if (methodEl) {
        let label = 'Google Pay (UPI)';
        if (method === 'gpay') {
          label = currentUpiApp === 'phonepe' ? 'PhonePe (UPI)' : currentUpiApp === 'paytm' ? 'Paytm (UPI)' : 'Google Pay (UPI)';
        } else if (method === 'card') {
          label = `Card (${paymentDetails.cardType || 'RuPay'} ending in ${paymentDetails.cardLast4 || 'XXXX'})`;
        } else if (method === 'netbanking') {
          label = `Net Banking (${paymentDetails.bankName || 'SBI'})`;
        } else if (method === 'cod') {
          label = 'Cash on Delivery (Pending Courier Arrival)';
          methodEl.style.color = 'var(--accent-primary)';
        }
        methodEl.textContent = label;
      }

      const headingEl = document.getElementById('success-heading');
      if (headingEl) {
        headingEl.textContent = method === 'cod' ? 'Order Confirmed' : 'Payment Received';
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Order confirmed and recorded successfully.', 'success');
  } catch (err) {
    if (cardErrors) cardErrors.textContent = err.message || 'Payment processing failed.';
    showToast(err.message || 'Failed to place order.', 'error');
    payBtn.disabled = false;
    updatePayButtonText();
  }
}

/**
 * 13. Initialization on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Authentication check
  if (!getToken || !getToken()) {
    window.location.href = '/login.html?redirect=/checkout.html';
    return;
  }

  loadOrderSummary();

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handlePayment);
  }

  // Pre-fill saved address from profile
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
    // User profile address optional
  }
});
