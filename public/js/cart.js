/**
 * cart.js — Shopping cart logic using localStorage
 * Provides: add, remove, update qty, get items, get total, get count
 * Also renders the full cart page and updates the navbar badge.
 */

const CART_KEY = 'quartcart_bag';

// ─── Core Cart Functions ───────────────────────────────────

/**
 * Get all cart items.
 * @returns {Array} cart items array
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Save cart array to localStorage.
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Add a product to the cart or increment qty.
 * @param {object} product - { _id, name, price, images, stock }
 * @param {number} qty
 */
function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex((item) => item._id === product._id);

  if (idx >= 0) {
    const newQty = cart[idx].qty + qty;
    cart[idx].qty = Math.min(newQty, product.stock || 999);
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: (product.images && product.images[0]) || '',
      stock: product.stock || 999,
      qty,
    });
  }

  saveCart(cart);
  showToast(`Added to your bag ✨`, 'success');
}

/**
 * Remove an item from the cart by product ID.
 */
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item._id !== productId);
  saveCart(cart);
}

/**
 * Update quantity for a cart item.
 */
function updateCartQty(productId, qty) {
  const cart = getCart();
  const idx = cart.findIndex((item) => item._id === productId);
  if (idx >= 0) {
    if (qty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].qty = Math.min(qty, cart[idx].stock || 999);
    }
    saveCart(cart);
  }
}

/**
 * Get total number of items in cart.
 */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Get cart subtotal.
 */
function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Clear the entire cart.
 */
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

/**
 * Update all cart badge elements in the DOM.
 */
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─── Cart Page Renderer ────────────────────────────────────

const cartTableBody = document.getElementById('cart-items');
const cartEmpty     = document.getElementById('cart-empty');
const cartFull      = document.getElementById('cart-full');
const subtotalEl    = document.getElementById('cart-subtotal');
const totalEl       = document.getElementById('cart-total');
const shippingEl    = document.getElementById('cart-shipping');

const SHIPPING_THRESHOLD = 50; // Free shipping above $50

function renderCartPage() {
  if (!cartTableBody) return; // Not on cart page

  const cart = getCart();

  if (cart.length === 0) {
    if (cartEmpty)  cartEmpty.classList.remove('hidden');
    if (cartFull)   cartFull.classList.add('hidden');
    return;
  }

  if (cartEmpty)  cartEmpty.classList.add('hidden');
  if (cartFull)   cartFull.classList.remove('hidden');

  cartTableBody.innerHTML = cart.map((item) => `
    <tr data-id="${item._id}">
      <td>
        <div class="flex" style="gap:0.75rem; align-items:center;">
          <img
            src="${item.image || `https://via.placeholder.com/60x60/ece9ff/6C63FF?text=${encodeURIComponent(item.name.slice(0,4))}`}"
            alt="${item.name}"
            class="cart-item-img"
            onerror="this.src='https://via.placeholder.com/60x60/ece9ff/6C63FF?text=IMG'"
          >
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="text-muted fs-sm">${formatPrice(item.price)} each</div>
          </div>
        </div>
      </td>
      <td>
        <div class="qty-control">
          <button type="button" class="qty-dec" data-id="${item._id}">−</button>
          <input type="number" value="${item.qty}" min="1" max="${item.stock}" class="qty-input" data-id="${item._id}" readonly>
          <button type="button" class="qty-inc" data-id="${item._id}">+</button>
        </div>
      </td>
      <td class="fw-bold text-primary">${formatPrice(item.price * item.qty)}</td>
      <td>
        <button class="btn btn-danger btn-sm remove-item" data-id="${item._id}" title="Remove">✕</button>
      </td>
    </tr>
  `).join('');

  updateCartSummary();
  attachCartEvents();
}

function updateCartSummary() {
  const subtotal = getCartTotal();
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 5.99;
  const total    = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (totalEl)    totalEl.textContent    = formatPrice(total);
}

function attachCartEvents() {
  // Quantity decrease
  document.querySelectorAll('.qty-dec').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = getCart().find((i) => i._id === id);
      if (item) updateCartQty(id, item.qty - 1);
      renderCartPage();
    });
  });

  // Quantity increase
  document.querySelectorAll('.qty-inc').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = getCart().find((i) => i._id === id);
      if (item) updateCartQty(id, item.qty + 1);
      renderCartPage();
    });
  });

  // Remove item
  document.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeFromCart(id);
      showToast('Item removed from cart', 'warning');
      renderCartPage();
    });
  });
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartPage();
});
