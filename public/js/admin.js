/**
 * admin.js - Complete Storefront Admin Control Center Logic
 * Controls Products, Inventory, Orders, Users, and Live Site/Theme Customization.
 */

'use strict';

let adminState = {
  stats: {},
  products: [],
  orders: [],
  users: [],
  config: {},
};

/**
 * Switch active Admin tab
 */
window.switchAdminTab = function (tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-tab-section').forEach((sec) => {
    sec.classList.toggle('hidden', sec.id !== `admin-tab-${tabName}`);
  });
};

/**
 * Quick preset image filler for Add Product form
 */
window.setPresetImage = function (url) {
  const input = document.getElementById('new-prod-image');
  if (input) {
    input.value = url;
    showToast('Preset image selected.', 'info');
  }
};

/**
 * Load all admin data in a single fast request
 */
async function loadAdminDashboard() {
  try {
    const data = await api.get('/admin/overview');
    adminState.stats = data.stats || {};
    adminState.products = data.products || [];
    adminState.orders = data.orders || [];
    adminState.users = data.users || [];
    adminState.config = data.config || {};

    renderAdminKPIs();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminUsers();
    populateSiteConfigForm();
  } catch (err) {
    showToast(err.message || 'Failed to load admin dashboard.', 'error');
  }
}

/**
 * 1. Render KPI Cards
 */
function renderAdminKPIs() {
  const s = adminState.stats;
  const revEl = document.getElementById('kpi-revenue');
  const prodEl = document.getElementById('kpi-products');
  const lowEl = document.getElementById('kpi-low-stock');
  const ordEl = document.getElementById('kpi-orders');
  const usrEl = document.getElementById('kpi-users');

  if (revEl) revEl.textContent = formatPrice(s.totalRevenue || 0);
  if (prodEl) prodEl.textContent = s.totalProducts || 0;
  if (lowEl) {
    lowEl.textContent = s.lowStockCount > 0 ? `${s.lowStockCount} low stock alert(s)` : 'All items well stocked';
  }
  if (ordEl) ordEl.textContent = s.totalOrders || 0;
  if (usrEl) usrEl.textContent = s.totalUsers || 0;
}

/**
 * 2. Render Products & Inventory Table
 */
window.renderAdminProducts = function () {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  const query = (document.getElementById('admin-prod-search')?.value || '').toLowerCase().trim();
  const list = adminState.products.filter((p) => {
    if (!query) return true;
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem;">No products found. Click "+ Seed Flagship Products" or use the form on the left to add items.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((p) => {
      const thumb = (p.images && p.images[0]) || 'https://via.placeholder.com/80';
      return `
        <tr>
          <td>
            <div class="flex" style="align-items:center;gap:0.85rem;">
              <img src="${thumb}" alt="${p.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;border:1px solid var(--border-subtle);">
              <div>
                <div style="font-weight:800;color:var(--text-main);">${p.name}</div>
                <div class="text-dim" style="font-size:0.76rem;text-transform:uppercase;font-weight:700;">${p.category}</div>
              </div>
            </div>
          </td>
          <td style="font-weight:800;color:var(--accent-primary);">${formatPrice(p.price)}</td>
          <td>
            <div class="flex" style="align-items:center;gap:0.4rem;">
              <span style="font-weight:800;min-width:28px;color:${p.stock <= 5 ? 'var(--danger)' : 'var(--text-main)'};">${p.stock}</span>
              <button type="button" class="preset-chip" onclick="adjustProductStock('${p._id}', 5)" title="Add 5 stock">+5</button>
              <button type="button" class="preset-chip" onclick="adjustProductStock('${p._id}', -1)" title="Subtract 1 stock">-1</button>
            </div>
          </td>
          <td>
            <button
              type="button"
              class="preset-chip"
              style="background:${p.isFeatured ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)'};color:${p.isFeatured ? '#fff' : 'var(--text-muted)'};"
              onclick="toggleProductFeatured('${p._id}', ${!p.isFeatured})"
            >
              ${p.isFeatured ? 'Featured' : 'Standard'}
            </button>
          </td>
          <td>
            <div class="flex" style="gap:0.45rem;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="openEditProductModal('${p._id}')">Edit</button>
              <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminProduct('${p._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
};

/**
 * Quick Stock Adjust
 */
window.adjustProductStock = async function (productId, delta) {
  const prod = adminState.products.find((p) => p._id === productId);
  if (!prod) return;
  const newStock = Math.max(0, (Number(prod.stock) || 0) + delta);
  try {
    await api.put(`/admin/products/${productId}`, { stock: newStock });
    prod.stock = newStock;
    renderAdminProducts();
    showToast(`Stock updated to ${newStock}.`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * Toggle Homepage Spotlight status
 */
window.toggleProductFeatured = async function (productId, isFeatured) {
  try {
    await api.put(`/admin/products/${productId}`, { isFeatured });
    const prod = adminState.products.find((p) => p._id === productId);
    if (prod) prod.isFeatured = isFeatured;
    renderAdminProducts();
    showToast(isFeatured ? 'Added to Homepage Spotlight.' : 'Removed from Homepage Spotlight.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * Delete Product
 */
window.deleteAdminProduct = async function (productId) {
  try {
    await api.delete(`/admin/products/${productId}`);
    adminState.products = adminState.products.filter((p) => p._id !== productId);
    adminState.stats.totalProducts = adminState.products.length;
    renderAdminKPIs();
    renderAdminProducts();
    showToast('Product deleted from catalog.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * Open & Close Edit Product Modal
 */
window.openEditProductModal = function (productId) {
  const prod = adminState.products.find((p) => p._id === productId);
  if (!prod) return;

  document.getElementById('edit-prod-id').value = prod._id;
  document.getElementById('edit-prod-name').value = prod.name || '';
  document.getElementById('edit-prod-category').value = prod.category || '';
  document.getElementById('edit-prod-price').value = prod.price || 0;
  document.getElementById('edit-prod-stock').value = prod.stock || 0;
  document.getElementById('edit-prod-featured').checked = Boolean(prod.isFeatured);
  document.getElementById('edit-prod-image').value = (prod.images && prod.images.join(', ')) || '';
  document.getElementById('edit-prod-desc').value = prod.description || '';

  document.getElementById('edit-product-modal').classList.add('open');
};

window.closeEditProductModal = function () {
  document.getElementById('edit-product-modal').classList.remove('open');
};

/**
 * Seed Sample Flagship Products
 */
window.seedSampleProducts = async function () {
  try {
    const res = await api.post('/admin/products/seed', {});
    showToast(res.message, 'success');
    await loadAdminDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * 3. Site & Theme Customizer Logic
 */
window.selectAdminTheme = function (theme, cardEl) {
  document.getElementById('cfg-themePalette').value = theme;
  document.querySelectorAll('.theme-option-card').forEach((c) => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');

  // Instant live preview right inside the page
  if (typeof applyConfigToDOM === 'function') {
    applyConfigToDOM({ ...adminState.config, themePalette: theme });
  }
};

function populateSiteConfigForm() {
  const c = adminState.config || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('cfg-themePalette', c.themePalette || 'terracotta');
  document.querySelectorAll('.theme-option-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.theme === (c.themePalette || 'terracotta'));
  });

  const bgCheck = document.getElementById('cfg-enable3DBackground');
  if (bgCheck) bgCheck.checked = c.enable3DBackground !== false;

  setVal('cfg-storeName', c.storeName || 'QuickCart');
  setVal('cfg-freeShippingThreshold', c.freeShippingThreshold !== undefined ? c.freeShippingThreshold : 150);
  setVal('cfg-supportEmail', c.supportEmail || 'support@quickcart.com');
  setVal('cfg-announcementText', c.announcementText || '');
  setVal('cfg-heroBadge', c.heroBadge || '');
  setVal('cfg-heroTitleLine1', c.heroTitleLine1 || '');
  setVal('cfg-heroTitleGradient', c.heroTitleGradient || '');
  setVal('cfg-heroSubtitle', c.heroSubtitle || '');
  setVal('cfg-heroPrimaryCtaText', c.heroPrimaryCtaText || '');
  setVal('cfg-heroSecondaryCtaText', c.heroSecondaryCtaText || '');
  setVal('cfg-studioModelName', c.studioModelName || '');
  setVal('cfg-studioPrice', c.studioPrice !== undefined ? c.studioPrice : 349);
  setVal('cfg-footerTagline', c.footerTagline || '');
}

/**
 * 4. Render Orders & Fulfillment Table
 */
function renderAdminOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (!adminState.orders || adminState.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No customer orders placed yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.orders
    .map((o) => {
      const customerName = (o.user && o.user.name) || 'Guest Customer';
      const customerEmail = (o.user && o.user.email) || '';
      const itemSummary = (o.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ');

      return `
        <tr>
          <td>
            <div style="font-weight:800;font-size:0.82rem;">#${String(o._id).slice(-8).toUpperCase()}</div>
            <div class="text-dim" style="font-size:0.75rem;">${formatDate(o.createdAt)}</div>
          </td>
          <td>
            <div style="font-weight:700;">${customerName}</div>
            <div class="text-dim" style="font-size:0.76rem;">${customerEmail}</div>
          </td>
          <td style="max-width:240px;font-size:0.82rem;color:var(--text-muted);">${itemSummary}</td>
          <td style="font-weight:800;color:var(--accent-primary);">${formatPrice(o.totalAmount || 0)}</td>
          <td>
            <select
              class="sort-select"
              style="padding:0.35rem 0.6rem;font-size:0.8rem;"
              onchange="updateAdminOrder('${o._id}', { paymentStatus: this.value })"
            >
              <option value="pending" ${o.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="paid" ${o.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
              <option value="failed" ${o.paymentStatus === 'failed' ? 'selected' : ''}>Failed</option>
            </select>
          </td>
          <td>
            <select
              class="sort-select"
              style="padding:0.35rem 0.6rem;font-size:0.8rem;"
              onchange="updateAdminOrder('${o._id}', { status: this.value })"
            >
              <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminOrder('${o._id}')">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

window.updateAdminOrder = async function (orderId, updates) {
  try {
    const res = await api.put(`/admin/orders/${orderId}`, updates);
    const idx = adminState.orders.findIndex((o) => o._id === orderId);
    if (idx !== -1 && res.order) adminState.orders[idx] = res.order;
    showToast('Order status updated.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteAdminOrder = async function (orderId) {
  try {
    await api.delete(`/admin/orders/${orderId}`);
    adminState.orders = adminState.orders.filter((o) => o._id !== orderId);
    adminState.stats.totalOrders = adminState.orders.length;
    renderAdminKPIs();
    renderAdminOrders();
    showToast('Order removed.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * 5. Render Users & Admins Table
 */
function renderAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (!adminState.users || adminState.users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:2rem;">No users registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.users
    .map((u) => {
      return `
        <tr>
          <td>
            <div style="font-weight:800;">${u.name}</div>
            <div class="text-dim" style="font-size:0.8rem;">${u.email}</div>
          </td>
          <td>
            <select
              class="sort-select"
              style="padding:0.32rem 0.6rem;font-size:0.8rem;"
              onchange="updateAdminUserRole('${u._id}', this.value)"
            >
              <option value="customer" ${u.role !== 'admin' ? 'selected' : ''}>Customer</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </td>
          <td class="text-dim" style="font-size:0.82rem;">${formatDate(u.createdAt)}</td>
          <td>
            <div class="flex" style="gap:0.45rem;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="resetAdminUserPassword('${u._id}', '${u.email}')">Set Password</button>
              <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminUser('${u._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

window.updateAdminUserRole = async function (userId, role) {
  try {
    await api.put(`/admin/users/${userId}`, { role });
    showToast(`User role updated to ${role}.`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.resetAdminUserPassword = async function (userId, email) {
  const newPassword = window.prompt(`Enter new password for ${email} (minimum 6 characters):`, 'Password123!');
  if (!newPassword) return;
  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }
  try {
    await api.put(`/admin/users/${userId}`, { password: newPassword });
    showToast(`Password updated for ${email}.`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteAdminUser = async function (userId) {
  try {
    await api.delete(`/admin/users/${userId}`);
    adminState.users = adminState.users.filter((u) => u._id !== userId);
    adminState.stats.totalUsers = adminState.users.length;
    renderAdminKPIs();
    renderAdminUsers();
    showToast('User account deleted.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * Initialize Form Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();

  // Add Product Form
  const addProdForm = document.getElementById('admin-add-product-form');
  if (addProdForm) {
    addProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('new-prod-name').value.trim(),
        category: document.getElementById('new-prod-category').value.trim(),
        price: Number(document.getElementById('new-prod-price').value),
        stock: Number(document.getElementById('new-prod-stock').value),
        isFeatured: document.getElementById('new-prod-featured').checked,
        images: [document.getElementById('new-prod-image').value.trim()],
        description: document.getElementById('new-prod-desc').value.trim(),
      };

      try {
        const res = await api.post('/admin/products', payload);
        adminState.products.unshift(res.product);
        adminState.stats.totalProducts = adminState.products.length;
        renderAdminKPIs();
        renderAdminProducts();
        addProdForm.reset();
        document.getElementById('new-prod-stock').value = 25;
        document.getElementById('new-prod-featured').checked = true;
        showToast('New product published to catalog.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Edit Product Form
  const editProdForm = document.getElementById('admin-edit-product-form');
  if (editProdForm) {
    editProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-prod-id').value;
      const payload = {
        name: document.getElementById('edit-prod-name').value.trim(),
        category: document.getElementById('edit-prod-category').value.trim(),
        price: Number(document.getElementById('edit-prod-price').value),
        stock: Number(document.getElementById('edit-prod-stock').value),
        isFeatured: document.getElementById('edit-prod-featured').checked,
        images: document.getElementById('edit-prod-image').value,
        description: document.getElementById('edit-prod-desc').value.trim(),
      };

      try {
        const res = await api.put(`/admin/products/${id}`, payload);
        const idx = adminState.products.findIndex((p) => p._id === id);
        if (idx !== -1 && res.product) adminState.products[idx] = res.product;
        renderAdminProducts();
        closeEditProductModal();
        showToast('Product updated.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Site Config Form
  const siteConfigForm = document.getElementById('admin-site-config-form');
  if (siteConfigForm) {
    siteConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        themePalette: document.getElementById('cfg-themePalette').value,
        enable3DBackground: document.getElementById('cfg-enable3DBackground').checked,
        storeName: document.getElementById('cfg-storeName').value.trim(),
        freeShippingThreshold: Number(document.getElementById('cfg-freeShippingThreshold').value),
        supportEmail: document.getElementById('cfg-supportEmail').value.trim(),
        announcementText: document.getElementById('cfg-announcementText').value.trim(),
        heroBadge: document.getElementById('cfg-heroBadge').value.trim(),
        heroTitleLine1: document.getElementById('cfg-heroTitleLine1').value.trim(),
        heroTitleGradient: document.getElementById('cfg-heroTitleGradient').value.trim(),
        heroSubtitle: document.getElementById('cfg-heroSubtitle').value.trim(),
        heroPrimaryCtaText: document.getElementById('cfg-heroPrimaryCtaText').value.trim(),
        heroSecondaryCtaText: document.getElementById('cfg-heroSecondaryCtaText').value.trim(),
        studioModelName: document.getElementById('cfg-studioModelName').value.trim(),
        studioPrice: Number(document.getElementById('cfg-studioPrice').value),
        footerTagline: document.getElementById('cfg-footerTagline').value.trim(),
      };

      try {
        const res = await api.put('/admin/config', payload);
        adminState.config = res.config;
        sessionStorage.setItem('quickcart_site_config', JSON.stringify(res.config));
        if (typeof applyConfigToDOM === 'function') {
          applyConfigToDOM(res.config);
        }
        showToast('All site changes saved and published live!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Add User Form
  const addUserForm = document.getElementById('admin-add-user-form');
  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('new-user-name').value.trim(),
        email: document.getElementById('new-user-email').value.trim(),
        password: document.getElementById('new-user-password').value,
        role: document.getElementById('new-user-role').value,
      };

      try {
        const res = await api.post('/admin/users', payload);
        adminState.users.unshift(res.user);
        adminState.stats.totalUsers = adminState.users.length;
        renderAdminKPIs();
        renderAdminUsers();
        addUserForm.reset();
        showToast('Account created successfully.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});
