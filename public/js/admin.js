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
 * Show the security gate and hide the protected admin workspace
 */
function showAdminSecurityGate(alertMessage = '') {
  const gate = document.getElementById('admin-security-gate');
  const workspace = document.getElementById('admin-protected-workspace');
  const alertEl = document.getElementById('admin-gate-alert');

  if (workspace) workspace.style.display = 'none';
  if (gate) gate.style.display = 'block';

  if (alertEl) {
    if (alertMessage) {
      alertEl.textContent = alertMessage;
      alertEl.classList.remove('hidden');
    } else {
      alertEl.classList.add('hidden');
    }
  }
}

/**
 * Unlock the protected admin workspace after server verification
 */
function unlockAdminWorkspace(user) {
  const gate = document.getElementById('admin-security-gate');
  const workspace = document.getElementById('admin-protected-workspace');
  const badge = document.getElementById('admin-identity-badge');

  if (gate) gate.style.display = 'none';
  if (workspace) workspace.style.display = 'block';
  if (badge && user) {
    badge.textContent = `${user.name || 'Owner'} (${user.email})`;
  }
  if (typeof injectAdminNavLink === 'function') {
    injectAdminNavLink();
  }
}

/**
 * Quick helper to fill default Owner credentials
 */
window.fillDefaultOwnerCredentials = function () {
  const emailInput = document.getElementById('admin-gate-email');
  const passInput = document.getElementById('admin-gate-password');
  const keyInput = document.getElementById('admin-gate-master-key');
  if (emailInput) emailInput.value = 'akash628484@gmail.com';
  if (passInput) passInput.value = 'Akash@6283077';
  if (keyInput) keyInput.value = 'kala_hu_re';
  showToast('Owner credentials filled. Click Verify & Unlock Admin Vault.', 'info');
};

/**
 * 1-Click Instant Owner Unlock (Automatic authentication with zero hassle)
 */
window.quickUnlockAsOwner = async function () {
  const submitBtn = document.getElementById('admin-gate-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Unlocking Vault...';
  }
  showToast('Authenticating Store Owner credentials...', 'info');

  try {
    const res = await api.post('/admin/login', {
      email: 'akash628484@gmail.com',
      password: 'Akash@6283077',
      masterKey: 'kala_hu_re',
    });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));

    if (typeof updateAuthNav === 'function') updateAuthNav();
    if (typeof injectAdminNavLink === 'function') injectAdminNavLink();

    showToast(`Welcome back, ${res.user.name}. Admin Vault unlocked.`, 'success');
    await loadAdminDashboard();
  } catch (err) {
    showToast(err.message || 'Auto-unlock failed. Please check credentials.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify & Unlock Admin Vault';
    }
  }
};

/**
 * Stepper Helpers for Numeric Inputs in Forms & Modals
 */
window.stepInput = function (inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const current = Number(input.value) || 0;
  const updated = Math.max(0, current + delta);
  input.value = updated;
};

window.setInputVal = function (inputId, val) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = val;
};

/**
 * Lock Admin Vault and sign out
 */
window.lockAdminSession = function () {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof injectAdminNavLink === 'function') {
    injectAdminNavLink();
  }
  if (typeof updateAuthNav === 'function') {
    updateAuthNav();
  }
  showAdminSecurityGate('Admin Vault locked. Authenticate as Website Owner or Administrator to re-enter.');
  showToast('Admin session locked.', 'info');
};

/**
 * Load all admin data in a single fast request (Protected by JWT + Admin Role)
 */
async function loadAdminDashboard() {
  const token = localStorage.getItem('token');
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    currentUser = null;
  }

  // Check URL query parameters for direct master key access (e.g. ?key=kala_hu_re)
  const urlParams = new URLSearchParams(window.location.search);
  const urlKey = urlParams.get('key') || urlParams.get('masterkey');
  if (urlKey && urlKey === 'kala_hu_re' && !token) {
    await window.quickUnlockAsOwner();
    return;
  }

  if (!token) {
    showAdminSecurityGate();
    return;
  }

  try {
    const data = await api.get('/admin/overview');
    adminState.stats = data.stats || {};
    adminState.products = data.products || [];
    adminState.orders = data.orders || [];
    adminState.users = data.users || [];
    adminState.config = data.config || {};

    if (!currentUser || currentUser.role !== 'admin') {
      currentUser = { name: 'QuickCart Owner (Akash)', email: 'akash628484@gmail.com', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(currentUser));
    }

    unlockAdminWorkspace(currentUser);
    renderAdminKPIs();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminUsers();
    populateSiteConfigForm();
  } catch (err) {
    showAdminSecurityGate(
      err.message || 'Administrator verification required. Please sign in with your Owner/Admin account.'
    );
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

  renderAdminAnalytics();
}

/**
 * Render Visual Category & Inventory Valuation Chart Bars
 */
function renderAdminAnalytics() {
  const valEl = document.getElementById('analytics-total-stock-value');
  const barsEl = document.getElementById('admin-category-bars');
  if (!barsEl) return;

  const products = adminState.products || [];
  let totalStockVal = 0;
  const catMap = {};

  products.forEach((p) => {
    const val = (Number(p.price) || 0) * (Number(p.stock) || 0);
    totalStockVal += val;
    const cat = p.category || 'Other';
    if (!catMap[cat]) catMap[cat] = { count: 0, stock: 0, val: 0 };
    catMap[cat].count += 1;
    catMap[cat].stock += Number(p.stock) || 0;
    catMap[cat].val += val;
  });

  if (valEl) valEl.textContent = formatPrice(totalStockVal);

  const entries = Object.entries(catMap);
  if (entries.length === 0) {
    barsEl.innerHTML = `<div class="text-muted" style="font-size:0.85rem;">No inventory data to chart yet.</div>`;
    return;
  }

  const maxVal = Math.max(...entries.map(([, d]) => d.val), 1);

  barsEl.innerHTML = entries
    .map(([cat, d]) => {
      const pct = Math.max(8, Math.round((d.val / maxVal) * 100));
      return `
        <div style="padding:0.85rem 1rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;">
          <div class="flex-between" style="font-size:0.82rem;margin-bottom:0.35rem;">
            <strong>${cat} (${d.count})</strong>
            <span style="font-weight:700;color:var(--accent-primary);">${formatPrice(d.val)}</span>
          </div>
          <div style="width:100%;height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:var(--accent-gradient);border-radius:4px;transition:width 0.4s ease;"></div>
          </div>
          <div style="font-size:0.74rem;color:var(--text-muted);margin-top:0.35rem;">${d.stock} total units in stock</div>
        </div>
      `;
    })
    .join('');
}

/**
 * 1-Click Export Products to Excel-Compatible CSV
 */
window.exportProductsCSV = function () {
  const products = adminState.products || [];
  if (products.length === 0) {
    showToast('No products to export.', 'warning');
    return;
  }
  const headers = ['ID', 'Name', 'Category', 'Price (INR)', 'Stock', 'Featured', 'Avg Rating'];
  const rows = products.map((p) => [
    p._id,
    `"${String(p.name || '').replace(/"/g, '""')}"`,
    `"${String(p.category || '').replace(/"/g, '""')}"`,
    p.price || 0,
    p.stock || 0,
    p.isFeatured ? 'Yes' : 'No',
    p.avgRating || 0,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `QuickCart-Products-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  showToast('Exported Products catalog to CSV.', 'success');
};

/**
 * 1-Click Export Customer Orders to Excel-Compatible CSV
 */
window.exportOrdersCSV = function () {
  const orders = adminState.orders || [];
  if (orders.length === 0) {
    showToast('No customer orders to export.', 'warning');
    return;
  }
  const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Payment Method', 'Total Amount (INR)', 'Payment Status', 'Fulfillment Status', 'Items'];
  const rows = orders.map((o) => [
    o._id,
    o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '',
    `"${String((o.user && o.user.name) || 'Guest').replace(/"/g, '""')}"`,
    `"${String((o.user && o.user.email) || '').replace(/"/g, '""')}"`,
    `"${String(o.paymentMethod || 'gpay').toUpperCase()}"`,
    o.totalAmount || 0,
    o.paymentStatus || 'pending',
    o.status || 'processing',
    `"${(o.items || []).map((i) => `${i.name} x${i.qty}`).join('; ').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `QuickCart-Orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  showToast('Exported Customer Orders to CSV.', 'success');
};

/**
 * Helper to update live metrics across KPIs and department charts
 */
function updateLiveMetrics() {
  const products = adminState.products || [];
  adminState.stats.totalProducts = products.length;
  adminState.stats.lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 5).length;
  renderAdminKPIs();
}

/**
 * 2. Render Products & Inventory Table with Quantity Handles Suite & Inline Price Editor
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
      const stockNum = Number(p.stock) || 0;
      const statusPill =
        stockNum === 0
          ? `<span class="admin-stock-status-pill out-of-stock">Out of Stock</span>`
          : stockNum <= 5
          ? `<span class="admin-stock-status-pill low-stock">Low (${stockNum})</span>`
          : `<span class="admin-stock-status-pill in-stock">In Stock (${stockNum})</span>`;

      return `
        <tr>
          <td>
            <div class="flex" style="align-items:center;gap:0.85rem;">
              <img src="${thumb}" alt="${p.name}" style="width:50px;height:50px;border-radius:6px;object-fit:cover;border:1px solid var(--border-subtle);">
              <div>
                <div style="font-weight:800;color:var(--text-main);font-size:0.92rem;">${p.name}</div>
                <div class="text-dim" style="font-size:0.75rem;text-transform:uppercase;font-weight:700;">${p.category}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="admin-price-inline-wrap" title="Click to edit price directly, press Enter to save">
              <span class="admin-price-symbol">₹</span>
              <input
                type="number"
                class="admin-price-input"
                id="inline-price-${p._id}"
                value="${p.price}"
                min="0"
                step="1"
                onchange="setProductPriceDirect('${p._id}', this.value)"
                onkeydown="if(event.key==='Enter')this.blur()"
              >
            </div>
          </td>
          <td>
            <div class="admin-qty-container">
              <div class="flex" style="align-items:center;gap:0.55rem;">
                <div class="admin-qty-stepper">
                  <button type="button" class="admin-qty-btn btn-decrease" onclick="adjustProductStock('${p._id}', -1)" title="Decrease quantity by 1">-</button>
                  <input
                    type="number"
                    class="admin-qty-input"
                    id="stock-input-${p._id}"
                    value="${stockNum}"
                    min="0"
                    onchange="setProductStockDirect('${p._id}', this.value)"
                    onkeydown="if(event.key==='Enter')this.blur()"
                    title="Type exact quantity and press Enter"
                  >
                  <button type="button" class="admin-qty-btn" onclick="adjustProductStock('${p._id}', 1)" title="Increase quantity by 1">+</button>
                </div>
                ${statusPill}
              </div>
              <div class="admin-qty-quick-row">
                <button type="button" class="admin-qty-quick-chip" onclick="adjustProductStock('${p._id}', 1)" title="Add 1">+1</button>
                <button type="button" class="admin-qty-quick-chip" onclick="adjustProductStock('${p._id}', 5)" title="Add 5">+5</button>
                <button type="button" class="admin-qty-quick-chip" onclick="adjustProductStock('${p._id}', 10)" title="Add 10">+10</button>
                <button type="button" class="admin-qty-quick-chip" onclick="adjustProductStock('${p._id}', -1)" title="Subtract 1">-1</button>
                <button type="button" class="admin-qty-quick-chip" onclick="adjustProductStock('${p._id}', -5)" title="Subtract 5">-5</button>
                <button type="button" class="admin-qty-quick-chip chip-zero" onclick="setProductStockDirect('${p._id}', 0)" title="Set out of stock">0 (Out)</button>
              </div>
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
 * Adjust Product Stock by Delta (+1, -1, +5, etc.)
 */
window.adjustProductStock = async function (productId, delta) {
  const prod = adminState.products.find((p) => p._id === productId);
  if (!prod) return;
  const newStock = Math.max(0, (Number(prod.stock) || 0) + delta);
  prod.stock = newStock;

  // Immediate input reflection
  const inputEl = document.getElementById(`stock-input-${productId}`);
  if (inputEl) inputEl.value = newStock;

  try {
    const res = await api.patch(`/admin/products/${productId}/stock`, { delta });
    if (res.product) prod.stock = res.product.stock;
    renderAdminProducts();
    updateLiveMetrics();
    showToast(`Stock updated to ${prod.stock} for "${prod.name}".`, 'success');
  } catch (err) {
    try {
      const res = await api.put(`/admin/products/${productId}`, { stock: newStock });
      if (res.product) prod.stock = res.product.stock;
      renderAdminProducts();
      updateLiveMetrics();
      showToast(`Stock updated to ${prod.stock}.`, 'success');
    } catch (putErr) {
      showToast(putErr.message || err.message, 'error');
    }
  }
};

/**
 * Direct Stock Set (Typed value or Zero out)
 */
window.setProductStockDirect = async function (productId, rawVal) {
  const prod = adminState.products.find((p) => p._id === productId);
  if (!prod) return;
  const newStock = Math.max(0, parseInt(rawVal, 10) || 0);
  prod.stock = newStock;

  try {
    const res = await api.patch(`/admin/products/${productId}/stock`, { stock: newStock });
    if (res.product) prod.stock = res.product.stock;
    renderAdminProducts();
    updateLiveMetrics();
    showToast(`Stock set to ${prod.stock} for "${prod.name}".`, 'success');
  } catch (err) {
    try {
      const res = await api.put(`/admin/products/${productId}`, { stock: newStock });
      if (res.product) prod.stock = res.product.stock;
      renderAdminProducts();
      updateLiveMetrics();
      showToast(`Stock set to ${prod.stock}.`, 'success');
    } catch (putErr) {
      showToast(putErr.message || err.message, 'error');
    }
  }
};

/**
 * Direct Inline Price Set
 */
window.setProductPriceDirect = async function (productId, rawVal) {
  const prod = adminState.products.find((p) => p._id === productId);
  if (!prod) return;
  const newPrice = Math.max(0, parseFloat(rawVal) || 0);
  prod.price = newPrice;

  try {
    const res = await api.patch(`/admin/products/${productId}/price`, { price: newPrice });
    if (res.product) prod.price = res.product.price;
    renderAdminProducts();
    updateLiveMetrics();
    showToast(`Price updated to ${formatPrice(prod.price)} for "${prod.name}".`, 'success');
  } catch (err) {
    try {
      const res = await api.put(`/admin/products/${productId}`, { price: newPrice });
      if (res.product) prod.price = res.product.price;
      renderAdminProducts();
      updateLiveMetrics();
      showToast(`Price updated to ${formatPrice(prod.price)}.`, 'success');
    } catch (putErr) {
      showToast(putErr.message || err.message, 'error');
    }
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
  const prod = adminState.products.find((p) => p._id === productId);
  const name = prod ? prod.name : 'this item';
  if (!window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
    return;
  }
  try {
    await api.delete(`/admin/products/${productId}`);
    adminState.products = adminState.products.filter((p) => p._id !== productId);
    updateLiveMetrics();
    renderAdminProducts();
    showToast(`"${name}" was deleted from catalog.`, 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete product.', 'error');
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
  const modal = document.getElementById('edit-product-modal');
  if (modal) modal.classList.remove('open');
};

// Close modal when clicking backdrop outside content
document.addEventListener('click', (e) => {
  const modal = document.getElementById('edit-product-modal');
  if (modal && e.target === modal) {
    window.closeEditProductModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeEditProductModal();
  }
});

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

  setVal('cfg-themePalette', c.themePalette || 'cerulean_rose');
  document.querySelectorAll('.theme-option-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.theme === (c.themePalette || 'cerulean_rose'));
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
    .map((o, idx) => {
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
          <td>
            <div style="font-weight:800;color:var(--accent-primary);">${formatPrice(o.totalAmount || 0)}</div>
            <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;font-weight:700;">${o.paymentMethod || 'gpay'}</div>
          </td>
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
            <div class="admin-action-row">
              <button type="button" class="btn btn-secondary btn-sm" onclick="downloadOrderInvoice(adminState.orders[${idx}])">Invoice PDF</button>
              <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminOrder('${o._id}')">Delete</button>
            </div>
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
  // Owner & Admin Security Gate Form
  const gateForm = document.getElementById('admin-gate-login-form');
  if (gateForm) {
    gateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('admin-gate-submit-btn');
      const email = document.getElementById('admin-gate-email').value.trim();
      const password = document.getElementById('admin-gate-password').value;
      const masterKey = document.getElementById('admin-gate-master-key').value.trim();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Administrator...';
      }

      try {
        const res = await api.post('/admin/login', { email, password, masterKey });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        if (typeof updateAuthNav === 'function') {
          updateAuthNav();
        }
        if (typeof injectAdminNavLink === 'function') {
          injectAdminNavLink();
        }

        showToast(`Welcome back, ${res.user.name}. Admin Vault unlocked.`, 'success');
        await loadAdminDashboard();
      } catch (err) {
        showAdminSecurityGate(err.message || 'Invalid Administrator credentials.');
        showToast(err.message || 'Authentication failed.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Verify & Unlock Admin Vault';
        }
      }
    });
  }

  loadAdminDashboard();

  // Add Product Form
  const addProdForm = document.getElementById('admin-add-product-form');
  if (addProdForm) {
    addProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = addProdForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing Product...';
      }

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
        updateLiveMetrics();
        renderAdminProducts();
        addProdForm.reset();
        document.getElementById('new-prod-stock').value = 25;
        document.getElementById('new-prod-featured').checked = true;
        showToast(`Product "${res.product.name}" published to store!`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to publish product.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Publish Product to Store';
        }
      }
    });
  }

  // Edit Product Form
  const editProdForm = document.getElementById('admin-edit-product-form');
  if (editProdForm) {
    editProdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = editProdForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';
      }

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
        updateLiveMetrics();
        renderAdminProducts();
        closeEditProductModal();
        showToast('Product updated successfully.', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update product.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Product Changes';
        }
      }
    });
  }

  // Site Config Form
  const siteConfigForm = document.getElementById('admin-site-config-form');
  if (siteConfigForm) {
    siteConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = siteConfigForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing Site Customizations...';
      }

      const payload = {
        themePalette: document.getElementById('cfg-themePalette')?.value || 'terracotta',
        enable3DBackground: Boolean(document.getElementById('cfg-enable3DBackground')?.checked),
        storeName: document.getElementById('cfg-storeName')?.value.trim() || 'QuickCart',
        freeShippingThreshold: Number(document.getElementById('cfg-freeShippingThreshold')?.value) || 999,
        supportEmail: document.getElementById('cfg-supportEmail')?.value.trim() || 'concierge@quickcart.com',
        announcementText: document.getElementById('cfg-announcementText')?.value.trim() || '',
        heroBadge: document.getElementById('cfg-heroBadge')?.value.trim() || '',
        heroTitleLine1: document.getElementById('cfg-heroTitleLine1')?.value.trim() || '',
        heroTitleGradient: document.getElementById('cfg-heroTitleGradient')?.value.trim() || '',
        heroSubtitle: document.getElementById('cfg-heroSubtitle')?.value.trim() || '',
        heroPrimaryCtaText: document.getElementById('cfg-heroPrimaryCtaText')?.value.trim() || '',
        heroSecondaryCtaText: document.getElementById('cfg-heroSecondaryCtaText')?.value.trim() || '',
        studioModelName: document.getElementById('cfg-studioModelName')?.value.trim() || '',
        studioPrice: Number(document.getElementById('cfg-studioPrice')?.value) || 24999,
        footerTagline: document.getElementById('cfg-footerTagline')?.value.trim() || '',
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
        showToast(err.message || 'Failed to save site configuration.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save & Publish All Site Changes Live';
        }
      }
    });
  }

  // Add User Form
  const addUserForm = document.getElementById('admin-add-user-form');
  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = addUserForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
      }

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
        showToast(err.message || 'Failed to create user account.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
      }
    });
  }
});
