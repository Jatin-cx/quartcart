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
    // Don't redirect if already on auth pages
    const path = window.location.pathname;
    if (!path.includes('login') && !path.includes('register')) {
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

// ─── Format Currency ───────────────────────────────────────
function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

// ─── Inject Admin Control Center Link into Navbar ──────────
function injectAdminNavLink() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks || document.getElementById('nav-admin-link')) return;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.id = 'nav-admin-link';
  a.href = '/admin.html';
  a.textContent = 'Admin';
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

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  injectAdminNavLink();
  setActiveNavLink();
  initMobileMenu();
  ensure3DEnginesLoaded();
  syncLiveSiteConfig();
});


