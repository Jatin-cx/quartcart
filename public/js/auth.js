/**
 * auth.js — Login, Register, Logout, Navbar state management
 */

/**
 * Get current user from localStorage.
 * @returns {object|null}
 */
function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get JWT token from localStorage.
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Check if user is logged in.
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Store auth data in localStorage.
 */
function storeAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data and redirect to login.
 */
function logout(redirect = true) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (redirect) {
    window.location.href = '/login.html';
  }
}

/**
 * Update navbar to reflect current auth state.
 */
function updateNavbar() {
  const user = getUser();
  const accountLink = document.getElementById('nav-account-link');
  const logoutBtn = document.getElementById('nav-logout-btn');

  if (accountLink) {
    if (user) {
      accountLink.href = '/account.html';
      accountLink.textContent = user.name ? user.name.split(' ')[0] : 'Account';
    } else {
      accountLink.href = '/login.html';
      accountLink.textContent = 'Login';
    }
  }

  if (logoutBtn) {
    logoutBtn.style.display = user ? 'inline-block' : 'none';
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Show field-level validation error.
 */
function showFieldError(inputEl, message) {
  inputEl.classList.add('is-invalid');
  let errEl = inputEl.nextElementSibling;
  if (!errEl || !errEl.classList.contains('field-error')) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    inputEl.after(errEl);
  }
  errEl.textContent = message;
}

/**
 * Clear all field errors in a form.
 */
function clearFieldErrors(formEl) {
  formEl.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  formEl.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
}

// ─── Register Form ─────────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
  // Redirect if already logged in
  if (isLoggedIn()) window.location.href = '/account.html';

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(registerForm);

    const name     = registerForm.querySelector('#name').value.trim();
    const email    = registerForm.querySelector('#email').value.trim();
    const password = registerForm.querySelector('#password').value;
    const confirm  = registerForm.querySelector('#confirm-password').value;

    let valid = true;

    if (!name) {
      showFieldError(registerForm.querySelector('#name'), 'Name is required');
      valid = false;
    }
    if (!email) {
      showFieldError(registerForm.querySelector('#email'), 'Email is required');
      valid = false;
    }
    if (password.length < 6) {
      showFieldError(registerForm.querySelector('#password'), 'Password must be at least 6 characters');
      valid = false;
    }
    if (password !== confirm) {
      showFieldError(registerForm.querySelector('#confirm-password'), 'Passwords do not match');
      valid = false;
    }
    if (!valid) return;

    const submitBtn = registerForm.querySelector('[type=submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Creating account…';

    try {
      const data = await api.post('/auth/register', { name, email, password });
      storeAuth(data.token, data.user);
      showToast('Account created! Welcome to ShopEase 🎉', 'success');
      setTimeout(() => { window.location.href = '/account.html'; }, 800);
    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

// ─── Login Form ────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
  // Redirect if already logged in
  if (isLoggedIn()) window.location.href = '/account.html';

  // Show session expired message
  const params = new URLSearchParams(window.location.search);
  if (params.get('session') === 'expired') {
    const alertEl = document.getElementById('login-alert');
    if (alertEl) {
      alertEl.textContent = 'Your session expired. Please log in again.';
      alertEl.classList.remove('hidden');
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(loginForm);

    const email    = loginForm.querySelector('#email').value.trim();
    const password = loginForm.querySelector('#password').value;

    let valid = true;
    if (!email) {
      showFieldError(loginForm.querySelector('#email'), 'Email is required');
      valid = false;
    }
    if (!password) {
      showFieldError(loginForm.querySelector('#password'), 'Password is required');
      valid = false;
    }
    if (!valid) return;

    const submitBtn = loginForm.querySelector('[type=submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Signing in…';

    try {
      const data = await api.post('/auth/login', { email, password });
      storeAuth(data.token, data.user);
      showToast('Welcome back! 👋', 'success');
      // Redirect to previous page or account
      const redirect = params.get('redirect') || '/account.html';
      setTimeout(() => { window.location.href = redirect; }, 600);
    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// Init on load
document.addEventListener('DOMContentLoaded', updateNavbar);
