/**
 * account.js — User profile display, order history, logout
 */

const profileName    = document.getElementById('profile-name');
const profileEmail   = document.getElementById('profile-email');
const profileAddress = document.getElementById('profile-address');
const profileAvatar  = document.getElementById('profile-avatar');
const ordersTableBody = document.getElementById('orders-table-body');
const ordersEmpty    = document.getElementById('orders-empty');
const logoutBtn      = document.getElementById('logout-btn');

/**
 * Load and render user profile.
 */
async function loadProfile() {
  try {
    const data = await api.get('/auth/profile');
    const user = data.user;

    if (profileAvatar) {
      profileAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
    }
    if (profileName) profileName.textContent = user.name || '—';
    if (profileEmail) profileEmail.textContent = user.email || '—';

    if (profileAddress) {
      const addr = user.address;
      if (addr && (addr.street || addr.city)) {
        const parts = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean);
        profileAddress.textContent = parts.join(', ');
      } else {
        profileAddress.textContent = 'No address on file';
      }
    }

    // Pre-fill edit form if present
    const editName    = document.getElementById('edit-name');
    const editStreet  = document.getElementById('edit-street');
    const editCity    = document.getElementById('edit-city');
    const editState   = document.getElementById('edit-state');
    const editZip     = document.getElementById('edit-zip');
    const editCountry = document.getElementById('edit-country');

    if (editName)    editName.value    = user.name || '';
    if (editStreet)  editStreet.value  = (user.address && user.address.street)  || '';
    if (editCity)    editCity.value    = (user.address && user.address.city)    || '';
    if (editState)   editState.value   = (user.address && user.address.state)   || '';
    if (editZip)     editZip.value     = (user.address && user.address.zip)     || '';
    if (editCountry) editCountry.value = (user.address && user.address.country) || '';

  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Load and render order history.
 */
async function loadOrders() {
  if (!ordersTableBody) return;

  ordersTableBody.innerHTML = `
    <tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">
      <div class="spinner" style="margin:0 auto 0.5rem;"></div> Loading orders…
    </td></tr>
  `;

  try {
    const data = await api.get('/orders/my');
    const orders = data.orders;

    if (!orders || orders.length === 0) {
      ordersTableBody.innerHTML = '';
      if (ordersEmpty) ordersEmpty.classList.remove('hidden');
      return;
    }

    if (ordersEmpty) ordersEmpty.classList.add('hidden');

    ordersTableBody.innerHTML = orders.map((order) => `
      <tr>
        <td>
          <span class="fw-bold fs-sm" style="font-family:monospace;">#${order._id.slice(-8).toUpperCase()}</span>
        </td>
        <td>${formatDate(order.createdAt)}</td>
        <td>
          <span class="status-badge ${order.status}">${order.status}</span>
        </td>
        <td>
          <span class="status-badge ${order.paymentStatus}">${order.paymentStatus}</span>
        </td>
        <td class="fw-bold text-primary">${formatPrice(order.totalAmount)}</td>
        <td>
          <details style="cursor:pointer;">
            <summary class="btn btn-secondary btn-sm" style="display:inline-block;list-style:none;">
              View Items
            </summary>
            <div style="margin-top:0.5rem;min-width:220px;">
              ${order.items.map((item) => `
                <div class="flex-between" style="font-size:0.82rem;padding:0.2rem 0;border-bottom:1px solid var(--light-2);">
                  <span>${item.name} ×${item.qty}</span>
                  <span>${formatPrice(item.price * item.qty)}</span>
                </div>
              `).join('')}
            </div>
          </details>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    ordersTableBody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--danger);">
        Failed to load orders: ${err.message}
      </td></tr>
    `;
  }
}

// ─── Profile Edit Form ─────────────────────────────────────
const profileEditForm = document.getElementById('profile-edit-form');
if (profileEditForm) {
  profileEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = profileEditForm.querySelector('[type=submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Saving…';

    try {
      const payload = {
        name: document.getElementById('edit-name')?.value.trim(),
        address: {
          street:  document.getElementById('edit-street')?.value.trim(),
          city:    document.getElementById('edit-city')?.value.trim(),
          state:   document.getElementById('edit-state')?.value.trim(),
          zip:     document.getElementById('edit-zip')?.value.trim(),
          country: document.getElementById('edit-country')?.value.trim(),
        },
      };

      const data = await api.put('/auth/profile', payload);

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.user));

      showToast('Profile updated successfully!', 'success');
      await loadProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  });
}

// ─── Logout ────────────────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Protect this page
  if (!getToken || !getToken()) {
    window.location.href = '/login.html?redirect=/account.html';
    return;
  }

  loadProfile();
  loadOrders();
});
