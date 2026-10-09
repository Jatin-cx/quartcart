/**
 * product-detail.js - Fetch and render single product, handle add to cart
 */

const detailContainer = document.getElementById('product-detail');
const detailLoading   = document.getElementById('detail-loading');
const detailError     = document.getElementById('detail-error');
const detailErrorMsg  = document.getElementById('detail-error-msg');

async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showDetailError('No product ID provided.');
    return;
  }

  try {
    const data = await api.get(`/products/${id}`);
    const product = data.product;
    renderProductDetail(product);
  } catch (err) {
    showDetailError(err.message);
  }
}

function showDetailError(message) {
  if (detailLoading) detailLoading.style.display = 'none';
  if (detailError) {
    if (detailErrorMsg) detailErrorMsg.textContent = message;
    detailError.style.display = 'block';
  }
  if (detailContainer) detailContainer.style.display = 'none';
}

function renderProductDetail(product) {
  if (detailLoading) detailLoading.style.display = 'none';
  if (detailContainer) detailContainer.style.display = 'block';

  document.title = `${product.name} - Quartcart`;

  const images = (product.images && product.images.length) ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];
  const inStock = product.stock > 0;

  detailContainer.innerHTML = `
    <div class="product-detail-grid">
      <!-- Media Column -->
      <div>
        <div class="gallery-main">
          <img id="main-product-img" src="${images[0]}" alt="${product.name}">
        </div>
        ${images.length > 1 ? `
          <div class="gallery-thumbs">
            ${images.map((imgUrl, i) => `
              <div class="thumb-item ${i === 0 ? 'active' : ''}" data-src="${imgUrl}">
                <img src="${imgUrl}" alt="Thumbnail ${i + 1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Specs Column -->
      <div>
        <div class="badge-tag">${product.category}</div>
        <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);margin-top:0.75rem;">${product.name}</h1>

        <div class="detail-price">${formatPrice(product.price)}</div>

        <div class="detail-desc">
          ${product.description}
        </div>

        <!-- Stock -->
        <div style="margin-bottom:2rem;padding:1rem 1.25rem;background:var(--bg-surface);border:1px solid var(--glass-border);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.05em;">Availability</div>
            <div style="font-weight:700;color:${inStock ? 'var(--success)' : 'var(--danger)'};">
              ${inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </div>
          </div>
          <div style="font-size:0.82rem;color:var(--text-dim);">
            Standard Carrier Shipping
          </div>
        </div>

        <!-- Add To Bag Bar -->
        <div class="flex" style="gap:1rem;align-items:center;">
          <div class="qty-control" style="padding:0.25rem;">
            <button type="button" class="qty-btn" id="qty-dec">−</button>
            <span class="qty-val" id="qty-val">1</span>
            <button type="button" class="qty-btn" id="qty-inc">+</button>
          </div>

          <button
            class="btn btn-primary btn-lg"
            id="detail-add-cart-btn"
            style="flex:1;"
            ${!inStock ? 'disabled' : ''}
          >
            ${inStock ? 'Add To Bag' : 'Out of Stock'}
          </button>
        </div>

        <!-- Value Badges -->
        <div style="margin-top:2.5rem;padding-top:2rem;border-top:1px solid var(--border-subtle);display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
          <div>
            <h5 style="font-size:0.88rem;margin-bottom:0.2rem;">Express Dispatch</h5>
            <p style="font-size:0.8rem;color:var(--text-dim);">Courier dispatch with live tracking</p>
          </div>
          <div>
            <h5 style="font-size:0.88rem;margin-bottom:0.2rem;">30-Day Returns</h5>
            <p style="font-size:0.8rem;color:var(--text-dim);">Standard return and refund policy</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach thumbnail clicks
  const thumbs = detailContainer.querySelectorAll('.thumb-item');
  const mainImg = document.getElementById('main-product-img');
  thumbs.forEach((th) => {
    th.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('active'));
      th.classList.add('active');
      if (mainImg) mainImg.src = th.dataset.src;
    });
  });

  // Quantity counter
  let currentQty = 1;
  const qtyVal = document.getElementById('qty-val');
  const decBtn = document.getElementById('qty-dec');
  const incBtn = document.getElementById('qty-inc');

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
      }
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      if (currentQty < product.stock) {
        currentQty++;
        qtyVal.textContent = currentQty;
      }
    });
  }

  // Add to Bag
  const addBtn = document.getElementById('detail-add-cart-btn');
  if (addBtn && inStock) {
    addBtn.addEventListener('click', () => {
      addToCart(product, currentQty);
    });
  }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);
