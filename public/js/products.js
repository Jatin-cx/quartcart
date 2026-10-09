/**
 * products.js - Product listing page: fetch, render, live-search, filter, sort
 */

const productsGrid   = document.getElementById('products-grid');
const searchInput    = document.getElementById('search-input');
const sortSelect     = document.getElementById('sort-select');
const categoryChips  = document.querySelectorAll('.filter-chip[data-category]');
const paginationEl   = document.getElementById('pagination');
const resultsCount   = document.getElementById('results-count');

let currentPage     = 1;
let currentSearch   = '';
let currentCategory = '';
let currentSort     = 'newest';
const PAGE_SIZE     = 12;
let searchDebounce  = null;

/**
 * Fetch and render products.
 */
async function loadProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div class="loading-grid" style="grid-column:1/-1;padding:4rem 0;">
      <div class="spinner"></div>
      <p class="text-center mt-2 text-muted">Retrieving catalog drops…</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (currentSearch)   params.set('search', currentSearch);
    if (currentCategory) params.set('category', currentCategory);
    if (currentSort)     params.set('sort', currentSort);
    params.set('page', currentPage);
    params.set('limit', PAGE_SIZE);

    const data = await api.get(`/products?${params.toString()}`);
    const { products, pagination } = data;

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:5rem 1rem;">
          <h3 style="font-size:1.4rem;color:#ffffff;">No Allocations Found</h3>
          <p class="text-muted mt-1">Try adjusting your search criteria or discipline filter.</p>
        </div>
      `;
      if (resultsCount) resultsCount.textContent = '0 items found';
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    if (resultsCount) {
      resultsCount.textContent = `${pagination.total} piece${pagination.total !== 1 ? 's' : ''} in archive`;
    }

    productsGrid.innerHTML = products.map(renderProductCard).join('');
    renderPagination(pagination);

    // Attach add-to-cart buttons
    productsGrid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = JSON.parse(btn.dataset.product);
        addToCart(product, 1);
      });
    });

    // Card click → product detail
    productsGrid.querySelectorAll('.product-card-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `/product-detail.html?id=${link.dataset.id}`;
      });
    });

  } catch (err) {
    productsGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 0;">
        <h3 style="color:#ffffff;">Connection Interrupted</h3>
        <p class="text-muted mt-1">${err.message}</p>
      </div>
    `;
    console.error(err);
  }
}

/**
 * Build HTML for a single product card.
 */
function renderProductCard(product) {
  const img = (product.images && product.images.length) ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const inStock = product.stock > 0;

  return `
    <article class="product-card">
      ${product.isFeatured ? '<span class="featured-badge">SPOTLIGHT</span>' : ''}
      <div class="product-card-img-wrapper product-card-link" data-id="${product._id}" style="cursor:pointer;">
        <img
          src="${img}"
          alt="${product.name}"
          class="product-card-img"
          loading="lazy"
        >
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${product.category}</span>
        <h3 class="product-card-name product-card-link" data-id="${product._id}" style="cursor:pointer;">${product.name}</h3>
        <div class="product-card-price-row">
          <div class="product-card-price">${formatPrice(product.price)}</div>
          <div class="product-card-stock ${inStock ? '' : 'out'}">${inStock ? 'Available' : 'Allocated'}</div>
        </div>
      </div>
      <div class="product-card-footer">
        <button
          class="btn btn-primary btn-block btn-sm add-to-cart-btn"
          data-product='${JSON.stringify({ _id: product._id, name: product.name, price: product.price, images: product.images, stock: product.stock })}'
          ${!inStock ? 'disabled' : ''}
        >
          ${inStock ? 'Add To Bag' : 'Sold Out'}
        </button>
      </div>
    </article>
  `;
}

/**
 * Render pagination controls.
 */
function renderPagination({ page, pages }) {
  if (!paginationEl || pages <= 1) {
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  let html = '<div class="flex-center" style="gap:0.5rem;margin-top:2.5rem;flex-wrap:wrap;">';

  if (page > 1) {
    html += `<button class="btn btn-secondary btn-sm page-btn" data-page="${page - 1}">← Previous</button>`;
  }

  for (let i = 1; i <= pages; i++) {
    if (i === page) {
      html += `<button class="btn btn-primary btn-sm" disabled>${i}</button>`;
    } else if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      html += `<button class="btn btn-secondary btn-sm page-btn" data-page="${i}">${i}</button>`;
    }
  }

  if (page < pages) {
    html += `<button class="btn btn-secondary btn-sm page-btn" data-page="${page + 1}">Next →</button>`;
  }

  html += '</div>';
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('.page-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ─── Event Listeners ───────────────────────────────────────
if (searchInput) {
  // Live instant debounce search as user types
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      loadProducts();
    }, 300);
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    loadProducts();
  });
}

categoryChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    categoryChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = chip.dataset.category || '';
    currentPage = 1;
    loadProducts();
  });
});

// Init on load with URL query parameter support
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get('category');
  const q   = urlParams.get('search');

  if (cat) {
    currentCategory = cat;
    categoryChips.forEach((c) => {
      if (c.dataset.category.toLowerCase() === cat.toLowerCase()) {
        categoryChips.forEach((x) => x.classList.remove('active'));
        c.classList.add('active');
      }
    });
  }

  if (q && searchInput) {
    searchInput.value = q;
    currentSearch = q;
  }

  loadProducts();
});
