/**
 * cart.js - Shopping bag logic & interactive slide-out drawer
 * Provides: getCart, saveCart, addToCart, removeFromCart, updateCartQty,
 * getCartCount, getCartTotal, clearCart, updateCartBadge, openCartDrawer, closeCartDrawer
 */

'use strict';

const CART_KEY = 'quickcart_bag';
const SHIPPING_THRESHOLD = 999; // Free shipping above ₹999

// ─── 1. Core Data Helpers ─────────────────────────────────────

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  if (typeof renderCartPage === 'function') {
    renderCartPage();
  }
}

function addToCart(product, qty = 1) {
  if (!product || !product._id) return;
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
      image: (product.images && product.images[0]) || (product.image || ''),
      stock: product.stock || 999,
      qty: Math.max(1, qty),
    });
  }

  saveCart(cart);

  if (typeof showToast === 'function') {
    showToast(`${product.name || 'Item'} added to shopping bag`, 'success');
  }

  // Animate badge
  document.querySelectorAll('.cart-badge').forEach((b) => {
    b.classList.remove('badge-pop');
    void b.offsetWidth; // Trigger reflow
    b.classList.add('badge-pop');
  });

  // Open the interactive drawer immediately so user sees their bag
  openCartDrawer();
}

function removeFromCart(productId) {
  const item = getCart().find((i) => i._id === productId);
  const cart = getCart().filter((i) => i._id !== productId);
  saveCart(cart);
  if (typeof showToast === 'function') {
    showToast(`${item ? item.name : 'Item'} removed from bag`, 'info');
  }
}

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

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderCartDrawer();
  if (typeof renderCartPage === 'function') {
    renderCartPage();
  }
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// ─── 2. Universal Interactive Slide-Out Cart Drawer ───────────

function injectCartDrawer() {
  if (document.getElementById('cart-drawer-root')) return;

  const drawerHtml = `
    <div id="cart-drawer-root">
      <div id="cart-drawer-backdrop" class="cart-drawer-backdrop" aria-hidden="true"></div>
      <aside id="cart-drawer" class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Bag">
        <header class="cart-drawer-header">
          <div class="cart-drawer-title-row">
            <div class="cart-drawer-heading">
              <span class="cart-drawer-dot"></span>
              <h3>Shopping Bag</h3>
              <span class="cart-drawer-count" id="drawer-item-count">0 items</span>
            </div>
            <button type="button" class="cart-drawer-close" id="drawer-close-btn" aria-label="Close bag">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="cart-drawer-shipping-bar" id="drawer-shipping-notice">
            Free shipping across India on orders over ₹999
          </div>
        </header>

        <div class="cart-drawer-body" id="drawer-items-list">
          <!-- Rendered dynamically -->
        </div>

        <footer class="cart-drawer-footer" id="drawer-footer">
          <div class="cart-drawer-subtotal-row">
            <span>Subtotal</span>
            <span class="cart-drawer-total-val" id="drawer-subtotal">₹0</span>
          </div>
          <p class="cart-drawer-tax-note">Taxes and shipping calculated at checkout.</p>
          <div class="cart-drawer-actions">
            <a href="/checkout.html" class="btn btn-primary btn-block btn-lg" id="drawer-checkout-btn">
              Proceed to Checkout
            </a>
            <a href="/cart.html" class="btn btn-outline btn-block btn-sm">
              View Full Bag
            </a>
          </div>
        </footer>
      </aside>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', drawerHtml);

  // Event bindings
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });
}

function renderCartDrawer() {
  const list = document.getElementById('drawer-items-list');
  const countEl = document.getElementById('drawer-item-count');
  const subtotalEl = document.getElementById('drawer-subtotal');
  const shippingNotice = document.getElementById('drawer-shipping-notice');
  const footer = document.getElementById('drawer-footer');

  if (!list) return;

  const cart = getCart();
  const count = getCartCount();
  const subtotal = getCartTotal();

  if (countEl) countEl.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  if (subtotalEl) subtotalEl.textContent = typeof formatPrice === 'function' ? formatPrice(subtotal) : `₹${Math.round(subtotal)}`;

  if (shippingNotice) {
    if (subtotal >= SHIPPING_THRESHOLD) {
      shippingNotice.innerHTML = '<span style="color:#10b981;font-weight:600;">Complimentary Standard Shipping unlocked</span>';
    } else {
      const remaining = SHIPPING_THRESHOLD - subtotal;
      shippingNotice.innerHTML = `Add <strong>${typeof formatPrice === 'function' ? formatPrice(remaining) : '₹' + Math.round(remaining)}</strong> more for free shipping`;
    }
  }

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-drawer-empty">
        <div class="cart-drawer-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h4>Your bag is empty</h4>
        <p>Explore our current catalog to discover precision essentials.</p>
        <a href="/products.html" class="btn btn-primary btn-sm" onclick="closeCartDrawer()">
          Explore Products
        </a>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  list.innerHTML = cart.map((item) => {
    const formattedPrice = typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${Math.round(item.price)}`;
    const lineTotal = typeof formatPrice === 'function' ? formatPrice(item.price * item.qty) : `₹${Math.round(item.price * item.qty)}`;
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120';

    return `
      <div class="cart-drawer-item" data-id="${item._id}">
        <img src="${imgUrl}" alt="${item.name}" class="cart-drawer-thumb">
        <div class="cart-drawer-item-info">
          <div class="cart-drawer-item-title">${item.name}</div>
          <div class="cart-drawer-item-unit">${formattedPrice}</div>
          <div class="cart-drawer-qty-row">
            <div class="cart-drawer-stepper">
              <button type="button" class="drawer-qty-btn" onclick="updateCartQty('${item._id}', ${item.qty - 1})">-</button>
              <span class="drawer-qty-val">${item.qty}</span>
              <button type="button" class="drawer-qty-btn" onclick="updateCartQty('${item._id}', ${item.qty + 1})">+</button>
            </div>
            <button type="button" class="drawer-remove-link" onclick="removeFromCart('${item._id}')">Remove</button>
          </div>
        </div>
        <div class="cart-drawer-line-total">${lineTotal}</div>
      </div>
    `;
  }).join('');
}

function openCartDrawer() {
  injectCartDrawer();
  renderCartDrawer();
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.add('is-open');
  if (backdrop) backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
}

// ─── 3. Full Cart Page (cart.html) Renderer ──────────────────

function renderCartPage() {
  const cartTableBody = document.getElementById('cart-items');
  const cartEmpty     = document.getElementById('cart-empty');
  const cartFull      = document.getElementById('cart-full');
  const subtotalEl    = document.getElementById('cart-subtotal');
  const totalEl       = document.getElementById('cart-total');
  const shippingEl    = document.getElementById('cart-shipping');

  if (!cartTableBody) return; // Not on cart.html page

  const cart = getCart();

  if (cart.length === 0) {
    if (cartEmpty) {
      cartEmpty.style.display = 'block';
      cartEmpty.classList.remove('hidden');
    }
    if (cartFull) {
      cartFull.style.display = 'none';
      cartFull.classList.add('hidden');
    }
    return;
  }

  if (cartEmpty) {
    cartEmpty.style.display = 'none';
    cartEmpty.classList.add('hidden');
  }
  if (cartFull) {
    cartFull.style.display = 'grid';
    cartFull.classList.remove('hidden');
  }

  cartTableBody.innerHTML = cart.map((item) => {
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120';
    const unitPrice = typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${Math.round(item.price)}`;
    const linePrice = typeof formatPrice === 'function' ? formatPrice(item.price * item.qty) : `₹${Math.round(item.price * item.qty)}`;

    return `
      <tr data-id="${item._id}">
        <td>
          <div class="flex" style="gap:1rem; align-items:center;">
            <img src="${imgUrl}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'">
            <div>
              <div class="cart-item-name" style="font-weight:700;color:var(--text-main);font-size:0.95rem;">${item.name}</div>
              <div class="text-muted fs-sm">${unitPrice} each</div>
            </div>
          </div>
        </td>
        <td>
          <div class="qty-control">
            <button type="button" class="qty-dec" data-id="${item._id}">-</button>
            <input type="number" value="${item.qty}" min="1" max="${item.stock}" class="qty-input" data-id="${item._id}" readonly>
            <button type="button" class="qty-inc" data-id="${item._id}">+</button>
          </div>
        </td>
        <td class="fw-bold" style="color:var(--accent-primary);font-size:1.05rem;">${linePrice}</td>
        <td>
          <button class="btn btn-danger btn-sm remove-item" data-id="${item._id}" title="Remove">Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = typeof formatPrice === 'function' ? formatPrice(subtotal) : `₹${Math.round(subtotal)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : (typeof formatPrice === 'function' ? formatPrice(shipping) : `₹${Math.round(shipping)}`);
  if (totalEl) totalEl.textContent = typeof formatPrice === 'function' ? formatPrice(total) : `₹${Math.round(total)}`;

  // Attach button events
  cartTableBody.querySelectorAll('.qty-dec').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const item = getCart().find((i) => i._id === id);
      if (item) updateCartQty(id, item.qty - 1);
    };
  });

  cartTableBody.querySelectorAll('.qty-inc').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const item = getCart().find((i) => i._id === id);
      if (item) updateCartQty(id, item.qty + 1);
    };
  });

  cartTableBody.querySelectorAll('.remove-item').forEach((btn) => {
    btn.onclick = () => {
      removeFromCart(btn.dataset.id);
    };
  });
}

// ─── 4. Global Navigation & Setup ─────────────────────────────

function bindCartNavLinks() {
  document.querySelectorAll('.cart-link, [data-open-cart]').forEach((link) => {
    link.addEventListener('click', (e) => {
      // If user isn't already on cart.html, open drawer smoothly
      if (!window.location.pathname.endsWith('cart.html') && !window.location.pathname.endsWith('checkout.html')) {
        e.preventDefault();
        openCartDrawer();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  updateCartBadge();
  bindCartNavLinks();
  renderCartPage();
});
