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
    <span class="toast-dot" style="width:6px;height:6px;border-radius:50%;background:${type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : '#ffffff'};display:inline-block;flex-shrink:0;"></span>
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
    // Close on outside click
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
  return `https://via.placeholder.com/400x400/ece9ff/6C63FF?text=${encodeURIComponent(name.slice(0, 12))}`;
}

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  initMobileMenu();
});
