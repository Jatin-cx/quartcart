/**
 * api.js - Centralized fetch wrapper
 * Auto-attaches JWT from localStorage, handles 401 redirects, parses JSON.
 */

const API_BASE = '/api';

/**
 * Core fetch wrapper.
 * @param {string} endpoint - e.g. '/products' or '/auth/login'
 * @param {object} options  - fetch options override
 * @returns {Promise<any>}  - parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Don't set Content-Type if body is FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (networkError) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  // Handle 401: token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Don't redirect if already on auth or admin gate pages
    const path = window.location.pathname;
    if (!path.includes('login') && !path.includes('register') && !path.includes('admin')) {
      window.location.href = '/login.html?session=expired';
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Session expired. Please log in again.');
  }

  // Try to parse JSON
  let data;
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && data.message) ||
      (data && data.errors && data.errors.map((e) => e.msg).join(', ')) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// Convenience methods
const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: 'DELETE', ...options }),
};

// ─── Toast Notification Utility ───────────────────────────
const toastContainer = (() => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
})();

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms before auto-dismiss
 */
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-dot" style="width:8px;height:8px;border-radius:50%;background:${type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--accent-primary)'};display:inline-block;flex-shrink:0;"></span>
    <span>${message}</span>
  `;

  const container = document.getElementById('toast-container') || toastContainer;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ─── Loading Spinner Utility ───────────────────────────────
function showSpinner() {
  let overlay = document.getElementById('spinner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spinner-overlay';
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');
}

function hideSpinner() {
  const overlay = document.getElementById('spinner-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ─── Navbar Active Link Helper ─────────────────────────────
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// ─── Mobile Menu Toggle ────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }
}

// ─── Format Currency (Indian Rupee - INR) ───────────────────
function formatPrice(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

// ─── Format Date ───────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// Rating Helper
function renderStars(rating) {
  if (!rating) return '';
  return `${rating.toFixed(1)} / 5.0`;
}

// ─── Truncate Text ─────────────────────────────────────────
function truncate(str, max = 60) {
  return str && str.length > max ? str.slice(0, max) + '…' : str;
}

// ─── Image Placeholder ─────────────────────────────────────
function productImage(images, name = 'Product') {
  if (images && images.length > 0 && images[0]) return images[0];
  return `https://via.placeholder.com/400x400/f7ede2/e04f33?text=${encodeURIComponent(name.slice(0, 12))}`;
}

// ─── Auto-Inject 3D Retail Background & 3D Tilt Engine ─────
function ensure3DEnginesLoaded() {
  if (!document.querySelector('script[src*="bg-3d.js"]')) {
    const bgScript = document.createElement('script');
    bgScript.src = '/js/bg-3d.js?v=3';
    document.body.appendChild(bgScript);
  }
  if (!document.querySelector('script[src*="tilt3d.js"]')) {
    const tiltScript = document.createElement('script');
    tiltScript.src = '/js/tilt3d.js?v=3';
    document.body.appendChild(tiltScript);
  }
}

// ─── Inject Admin Control Center Link into Navbar (Owner / Admin Only) ─────
function injectAdminNavLink() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  const existingLink = document.getElementById('nav-admin-link');
  const token = localStorage.getItem('token');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  const isAdmin = Boolean(token && user && user.role === 'admin');
  if (!isAdmin) {
    if (existingLink && existingLink.parentElement) {
      existingLink.parentElement.remove();
    }
    return;
  }

  if (existingLink) return;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.id = 'nav-admin-link';
  a.href = '/admin.html';
  a.textContent = 'Admin Vault';
  a.style.cssText = 'font-weight:800;color:var(--accent-primary);border:1px dashed var(--accent-primary);padding:0.32rem 0.7rem;border-radius:6px;';
  if (window.location.pathname.includes('admin')) {
    a.classList.add('active');
  }
  li.appendChild(a);
  navLinks.appendChild(li);
}

// ─── Apply Live Storefront Config Across Every Page ────────
const THEME_PALETTES = {
  terracotta: {
    primary: '#e04f33',
    secondary: '#d97706',
    gradient: 'linear-gradient(135deg, #ea5838 0%, #c83b1f 100%)',
  },
  emerald: {
    primary: '#0d9488',
    secondary: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #0f766e 100%)',
  },
  gold: {
    primary: '#d97706',
    secondary: '#b45309',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  },
  crimson: {
    primary: '#e11d48',
    secondary: '#be123c',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
  },
  cobalt: {
    primary: '#2563eb',
    secondary: '#0284c7',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
};

function applyConfigToDOM(cfg) {
  if (!cfg) return;

  // 1. Theme Palette
  const pal = THEME_PALETTES[cfg.themePalette] || THEME_PALETTES.terracotta;
  document.documentElement.style.setProperty('--accent-primary', pal.primary);
  document.documentElement.style.setProperty('--accent-secondary', pal.secondary);
  document.documentElement.style.setProperty('--accent-gradient', pal.gradient);

  // 2. 3D Showroom Background visibility
  const bgCanvas = document.getElementById('retail-3d-bg-canvas');
  if (bgCanvas) {
    bgCanvas.style.display = cfg.enable3DBackground === false ? 'none' : 'block';
  }

  // 3. Brand Name
  if (cfg.storeName) {
    const formattedBrand =
      cfg.storeName.toLowerCase() === 'quickcart'
        ? 'Quick<span>Cart</span>'
        : cfg.storeName;
    document.querySelectorAll('.navbar-brand, .footer-brand').forEach((el) => {
      el.innerHTML = `<span class="brand-dot"></span> ${formattedBrand}`;
    });
  }

  // 4. Announcement Bar
  if (cfg.announcementText) {
    const annContainer = document.querySelector('.announcement-bar .container');
    if (annContainer) {
      annContainer.innerHTML = `<span>${cfg.announcementText}</span>`;
    }
  }

  // 5. Homepage Hero Elements
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const badgeEl = heroSection.querySelector('.hero-content .badge-tag');
    if (badgeEl && cfg.heroBadge) {
      badgeEl.innerHTML = `<span class="dot"></span> ${cfg.heroBadge}`;
    }
    const h1El = heroSection.querySelector('.hero-content h1');
    if (h1El && (cfg.heroTitleLine1 || cfg.heroTitleGradient)) {
      h1El.innerHTML = `${cfg.heroTitleLine1 || 'Precision Sound.'}<br><span class="hero-gradient-text">${cfg.heroTitleGradient || 'Engineered to Endure.'}</span>`;
    }
    const pEl = heroSection.querySelector('.hero-content p');
    if (pEl && cfg.heroSubtitle) {
      pEl.textContent = cfg.heroSubtitle;
    }
    const primaryCta = heroSection.querySelector('.hero-actions .btn-primary');
    if (primaryCta && cfg.heroPrimaryCtaText) {
      primaryCta.innerHTML = `${cfg.heroPrimaryCtaText} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
    }
    const secondaryCta = heroSection.querySelector('.hero-actions .btn-secondary');
    if (secondaryCta && cfg.heroSecondaryCtaText) {
      secondaryCta.textContent = cfg.heroSecondaryCtaText;
    }
    const modelEl = heroSection.querySelector('.hero-studio-model');
    if (modelEl && cfg.studioModelName) {
      modelEl.textContent = cfg.studioModelName;
    }
    const priceEl = heroSection.querySelector('.hero-price-val');
    if (priceEl && cfg.studioPrice !== undefined) {
      priceEl.textContent = formatPrice(cfg.studioPrice);
    }
  }

  // 6. Footer Tagline
  if (cfg.footerTagline) {
    const footerP = document.querySelector('footer .footer-col p');
    if (footerP) footerP.textContent = cfg.footerTagline;
  }
}

async function syncLiveSiteConfig() {
  try {
    sessionStorage.removeItem('quartcart_site_config');
    const cached = sessionStorage.getItem('quickcart_site_config');
    if (cached) {
      applyConfigToDOM(JSON.parse(cached));
    }
    const data = await api.get('/admin/config');
    if (data && data.config) {
      sessionStorage.setItem('quickcart_site_config', JSON.stringify(data.config));
      applyConfigToDOM(data.config);
    }
  } catch {
    // Fallback to default static HTML if offline
  }
}

// ─── Global Wishlist / Saved Favorites Engine ──────────────
const WISHLIST_KEY = 'quickcart_wishlist';

function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateWishlistBadge();
  renderWishlistDrawer();
}

function isInWishlist(productId) {
  return getWishlist().some((item) => item._id === productId);
}

function toggleWishlistItem(product) {
  if (!product || !product._id) return false;
  const list = getWishlist();
  const idx = list.findIndex((item) => item._id === product._id);
  let added = false;

  if (idx >= 0) {
    list.splice(idx, 1);
    showToast(`Removed "${product.name}" from Saved Wishlist.`, 'info');
  } else {
    list.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category || 'Flagship',
      image: (product.images && product.images[0]) || product.image || '',
      stock: product.stock !== undefined ? product.stock : 10,
    });
    added = true;
    showToast(`Saved "${product.name}" to your Wishlist!`, 'success');
  }

  saveWishlist(list);
  return added;
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-nav-badge');
  if (badge) {
    badge.textContent = getWishlist().length;
  }
}

function openWishlistDrawer() {
  let drawer = document.getElementById('wishlist-drawer-backdrop');
  if (!drawer) {
    injectWishlistUI();
    drawer = document.getElementById('wishlist-drawer-backdrop');
  }
  renderWishlistDrawer();
  if (drawer) drawer.style.display = 'flex';
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer-backdrop');
  if (drawer) drawer.style.display = 'none';
}

function renderWishlistDrawer() {
  const body = document.getElementById('wishlist-drawer-body');
  if (!body) return;

  const list = getWishlist();
  if (list.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:3rem 1.25rem;color:var(--text-muted);">
        <div style="font-weight:700;font-size:1.05rem;color:var(--text-primary);margin-bottom:0.4rem;">Your Saved Wishlist is Empty</div>
        <p style="font-size:0.86rem;margin-bottom:1.25rem;">Bookmark your favorite products while browsing to save them for later.</p>
        <a href="/products.html" class="btn btn-primary btn-sm">Explore Catalog</a>
      </div>
    `;
    return;
  }

  body.innerHTML = list
    .map(
      (item) => `
      <div style="display:flex;gap:0.85rem;align-items:center;padding:0.85rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;margin-bottom:0.75rem;">
        <img src="${item.image || 'https://via.placeholder.com/64'}" alt="${item.name}" style="width:58px;height:58px;border-radius:8px;object-fit:cover;border:1px solid var(--border);">
        <div style="flex:1;min-width:0;">
          <a href="/product-detail.html?id=${item._id}" style="font-weight:700;font-size:0.9rem;color:var(--text-primary);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</a>
          <div style="font-weight:800;font-size:0.86rem;color:var(--accent-primary);margin-top:0.15rem;">${formatPrice(item.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.35rem;">
          <button type="button" class="btn btn-primary btn-sm" style="padding:0.28rem 0.6rem;font-size:0.74rem;" onclick="moveWishlistToBag('${item._id}')">Move to Bag</button>
          <button type="button" class="btn btn-secondary btn-sm" style="padding:0.24rem 0.6rem;font-size:0.72rem;" onclick="removeWishlistById('${item._id}')">Remove</button>
        </div>
      </div>
    `
    )
    .join('');
}

window.moveWishlistToBag = function (productId) {
  const list = getWishlist();
  const item = list.find((x) => x._id === productId);
  if (!item) return;
  if (typeof addToCart === 'function') {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      images: [item.image],
      stock: item.stock || 10,
    }, 1);
  }
  removeWishlistById(productId);
  closeWishlistDrawer();
};

window.removeWishlistById = function (productId) {
  const list = getWishlist().filter((x) => x._id !== productId);
  saveWishlist(list);
};

function injectWishlistUI() {
  // 1. Add Saved button in Navbar before Bag
  const navLinks = document.getElementById('nav-links');
  if (navLinks && !document.getElementById('nav-wishlist-btn')) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'nav-wishlist-btn';
    btn.className = 'btn btn-secondary btn-sm';
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:0.35rem;padding:0.35rem 0.7rem;font-size:0.8rem;';
    btn.innerHTML = `Saved <span id="wishlist-nav-badge" style="background:var(--accent-primary);color:#fff;font-size:0.7rem;font-weight:800;padding:0.05rem 0.42rem;border-radius:4px;">${getWishlist().length}</span>`;
    btn.onclick = openWishlistDrawer;
    li.appendChild(btn);
    navLinks.insertBefore(li, navLinks.children[2] || null);
  }

  // 2. Create Wishlist Drawer Modal
  if (!document.getElementById('wishlist-drawer-backdrop')) {
    const wrap = document.createElement('div');
    wrap.id = 'wishlist-drawer-backdrop';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(30,22,18,0.52);backdrop-filter:blur(5px);z-index:2500;display:none;justify-content:flex-end;';
    wrap.innerHTML = `
      <div style="width:100%;max-width:410px;height:100%;background:var(--bg-card);border-left:1px solid var(--border);padding:1.75rem;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-lg);">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:1rem;border-bottom:1px solid var(--border);">
          <div>
            <span class="badge-tag" style="margin-bottom:0.25rem;">SAVED FAVORITES</span>
            <h3 style="font-size:1.3rem;">Your Wishlist</h3>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeWishlistDrawer()">Close</button>
        </div>
        <div id="wishlist-drawer-body" style="flex:1;overflow-y:auto;padding:1rem 0;"></div>
        <div style="padding-top:1rem;border-top:1px solid var(--border);display:flex;gap:0.65rem;">
          <a href="/products.html" class="btn btn-secondary btn-block">Browse Catalog</a>
          <a href="/cart.html" class="btn btn-primary btn-block">Open Bag</a>
        </div>
      </div>
    `;
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) closeWishlistDrawer();
    });
    document.body.appendChild(wrap);
  }
}

// ─── Official Printable / PDF Order Invoice Generator ──────
window.downloadOrderInvoice = function (order) {
  if (!order) return;
  const orderId = String(order._id || 'ORD-1001').slice(-8).toUpperCase();
  const dateStr = order.createdAt ? formatDate(order.createdAt) : formatDate(new Date());
  const customerName = (order.user && order.user.name) || 'Valued QuickCart Customer';
  const customerEmail = (order.user && order.user.email) || '';
  const addr = order.shippingAddress || {};
  const addressLine = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || 'Standard Digital / Express Delivery';
  const items = order.items || [];
  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1), 0);
  const total = Number(order.totalAmount || subtotal);

  const itemsHtml = items
    .map(
      (it, idx) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5d8c8;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5d8c8;font-weight:700;">${it.name || 'Product'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5d8c8;text-align:center;">${it.qty || 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5d8c8;text-align:right;">${formatPrice(it.price || 0)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5d8c8;text-align:right;font-weight:700;">${formatPrice((it.price || 0) * (it.qty || 1))}</td>
      </tr>
    `
    )
    .join('');

  const win = window.open('', '_blank', 'width=860,height=780');
  if (!win) {
    showToast('Please allow popups to view and download the PDF Invoice.', 'warning');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>QuickCart Tax Invoice #${orderId}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6efe6; color: #1e1612; margin: 0; padding: 32px; }
        .invoice-box { max-width: 760px; margin: 0 auto; background: #fffdf9; border: 1px solid #dfd1c2; border-top: 6px solid #e04f33; border-radius: 12px; padding: 36px; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #dfd1c2; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }
        .brand span { color: #e04f33; }
        .stamp { display: inline-block; padding: 6px 14px; border: 2px solid #0d9488; color: #0d9488; font-weight: 800; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 6px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; }
        th { background: #1e1612; color: #fff; text-align: left; padding: 10px 12px; }
        .totals { width: 280px; margin-left: auto; font-size: 14px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .totals-row.grand { border-top: 2px solid #1e1612; font-size: 18px; font-weight: 800; color: #e04f33; padding-top: 10px; margin-top: 6px; }
        .no-print { text-align: right; margin-bottom: 16px; max-width: 760px; margin-left: auto; margin-right: auto; }
        .btn-print { background: #e04f33; color: #fff; border: none; padding: 10px 20px; font-weight: 700; border-radius: 6px; cursor: pointer; }
        @media print { body { background: #fff; padding: 0; } .no-print { display: none; } .invoice-box { box-shadow: none; border: 1px solid #ccc; } }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="brand">Quick<span>Cart</span></div>
            <div style="font-size:13px;color:#7d6a5e;margin-top:4px;">Official Commercial Retail Invoice | concierge@quickcart.com</div>
          </div>
          <div style="text-align:right;">
            <div class="stamp">${(order.paymentStatus || 'PAID').toUpperCase()} / VERIFIED</div>
            <div style="font-size:14px;font-weight:700;margin-top:8px;">Invoice #INV-${orderId}</div>
            <div style="font-size:12px;color:#7d6a5e;">Date: ${dateStr}</div>
          </div>
        </div>
        <div class="meta-grid">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#7d6a5e;margin-bottom:4px;">Billed To</div>
            <div style="font-weight:700;">${customerName}</div>
            ${customerEmail ? `<div style="color:#4a3a31;">${customerEmail}</div>` : ''}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#7d6a5e;margin-bottom:4px;">Shipping Destination</div>
            <div>${addressLine}</div>
            <div style="font-size:12px;color:#0d9488;font-weight:700;margin-top:4px;">Fulfillment Status: ${(order.status || 'processing').toUpperCase()}</div>
            <div style="font-size:12px;color:#e04f33;font-weight:700;margin-top:2px;">Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Credit / Debit Card' : order.paymentMethod === 'netbanking' ? 'Net Banking' : 'Google Pay (UPI)'}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-row"><span>Items Subtotal:</span><strong>${formatPrice(subtotal)}</strong></div>
          <div class="totals-row"><span>Express Shipping:</span><strong>${total >= 999 ? 'COMPLIMENTARY' : '₹99'}</strong></div>
          <div class="totals-row grand"><span>Total Paid:</span><span>${formatPrice(total)}</span></div>
        </div>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #dfd1c2;font-size:12px;color:#7d6a5e;display:flex;justify-content:space-between;">
          <span>Thank you for shopping with QuickCart Flagship Storefront.</span>
          <span>30-Day Return Guarantee Included</span>
        </div>
      </div>
    </body>
    </html>
  `);
  win.document.close();
};

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  injectAdminNavLink();
  injectWishlistUI();
  setActiveNavLink();
  initMobileMenu();
  ensure3DEnginesLoaded();
  syncLiveSiteConfig();
});



