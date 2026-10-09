/**
 * product-detail.js - Single product view logic with interactive 3D model support
 */

'use strict';

async function loadProductDetail() {
  const detailContainer = document.getElementById('product-detail');
  const loadingEl       = document.getElementById('detail-loading');
  const errorEl         = document.getElementById('detail-error');
  const errorMsg        = document.getElementById('detail-error-msg');

  const params    = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      if (errorMsg) errorMsg.textContent = 'No product specified in request.';
    }
    return;
  }

  try {
    const data = await api.get(`/products/${productId}`);
    const product = data.product;

    if (!product) throw new Error('Product not found');

    if (loadingEl) loadingEl.style.display = 'none';
    if (detailContainer) detailContainer.style.display = 'block';

    renderProductDetail(product);
  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      if (errorMsg) errorMsg.textContent = err.message || 'Unable to retrieve product.';
    }
  }
}

function renderProductDetail(product) {
  const detailContainer = document.getElementById('product-detail');
  if (!detailContainer) return;

  document.title = `${product.name} - Quartcart`;

  const images = (product.images && product.images.length) ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];
  const inStock = product.stock > 0;
  const isAudioProduct = product.category === 'Audio' || (product.name && product.name.toLowerCase().includes('headphone'));

  detailContainer.innerHTML = `
    <div class="product-detail-grid">
      <!-- Media Column -->
      <div>
        ${isAudioProduct ? `
          <div style="display:flex;gap:0.6rem;margin-bottom:1.25rem;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-mode-photo" style="font-size:0.75rem;">Studio Gallery</button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-mode-3d" style="font-size:0.75rem;color:var(--accent-primary);border-color:rgba(0,242,254,0.4);">
              Interactive 3D Turntable
            </button>
          </div>
        ` : ''}

        <!-- 2D Gallery View -->
        <div id="view-photo-container">
          <div class="gallery-main" style="border-radius:var(--radius-md);overflow:hidden;background:#0d0f17;border:1px solid var(--glass-border);position:relative;">
            <img id="main-product-img" src="${images[0]}" alt="${product.name}" style="width:100%;aspect-ratio:1/1;object-fit:cover;transition:transform 0.4s ease;">
          </div>
          ${images.length > 1 ? `
            <div class="gallery-thumbs" style="display:flex;gap:0.75rem;margin-top:1rem;">
              ${images.map((imgUrl, i) => `
                <div class="thumb-item ${i === 0 ? 'active' : ''}" data-src="${imgUrl}" style="width:68px;height:68px;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border-subtle);cursor:pointer;">
                  <img src="${imgUrl}" alt="Thumbnail ${i + 1}" style="width:100%;height:100%;object-fit:cover;">
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- 3D Turntable View -->
        ${isAudioProduct ? `
          <div id="view-3d-container" style="display:none;" class="hero-studio-card">
            <div class="hero-studio-header">
              <span class="badge-tag" style="margin:0;"><span class="dot"></span>3D MODEL</span>
              <div class="hero-studio-controls">
                <span class="colorway-label">Finish:</span>
                <button type="button" class="colorway-btn active" title="Obsidian Black" onclick="setHeadphoneColorway('obsidian', this)">
                  <span class="color-swatch swatch-obsidian"></span>
                </button>
                <button type="button" class="colorway-btn" title="Titanium Silver" onclick="setHeadphoneColorway('titanium', this)">
                  <span class="color-swatch swatch-titanium"></span>
                </button>
                <button type="button" class="colorway-btn" title="Cyber Cyan" onclick="setHeadphoneColorway('cyan', this)">
                  <span class="color-swatch swatch-cyan"></span>
                </button>
              </div>
            </div>
            <div id="hero-3d-container" style="height:420px;">
              <span class="hero-3d-hint">360 Drag to Inspect</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Specs Column -->
      <div>
        <div class="badge-tag">${product.category}</div>
        <h1 style="font-size:clamp(1.8rem, 3.2vw, 2.4rem);margin-top:0.75rem;color:#ffffff;">${product.name}</h1>

        <div class="detail-price" style="font-size:1.8rem;font-weight:800;color:var(--accent-primary);margin:1rem 0;">${formatPrice(product.price)}</div>

        <div class="detail-desc" style="color:var(--text-muted);font-size:1rem;line-height:1.65;margin-bottom:2rem;">
          ${product.description}
        </div>

        <!-- Stock Status -->
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
            <button type="button" class="qty-btn" id="qty-dec">-</button>
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
            <h5 style="font-size:0.88rem;margin-bottom:0.2rem;color:#ffffff;">Express Dispatch</h5>
            <p style="font-size:0.8rem;color:var(--text-dim);">Courier dispatch with live tracking</p>
          </div>
          <div>
            <h5 style="font-size:0.88rem;margin-bottom:0.2rem;color:#ffffff;">30-Day Returns</h5>
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

  // Attach 2D vs 3D toggle
  if (isAudioProduct) {
    const btnPhoto = document.getElementById('btn-mode-photo');
    const btn3D = document.getElementById('btn-mode-3d');
    const boxPhoto = document.getElementById('view-photo-container');
    const box3D = document.getElementById('view-3d-container');

    if (btnPhoto && btn3D && boxPhoto && box3D) {
      btnPhoto.onclick = () => {
        btnPhoto.className = 'btn btn-primary btn-sm';
        btn3D.className = 'btn btn-outline btn-sm';
        boxPhoto.style.display = 'block';
        box3D.style.display = 'none';
      };
      btn3D.onclick = () => {
        btn3D.className = 'btn btn-primary btn-sm';
        btnPhoto.className = 'btn btn-outline btn-sm';
        boxPhoto.style.display = 'none';
        box3D.style.display = 'flex';
        if (typeof initHero3D === 'function') {
          setTimeout(initHero3D, 50);
        }
      };
    }
  }

  // Quantity counter
  let currentQty = 1;
  const qtyVal = document.getElementById('qty-val');
  const decBtn = document.getElementById('qty-dec');
  const incBtn = document.getElementById('qty-inc');

  if (decBtn) {
    decBtn.onclick = () => {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
      }
    };
  }

  if (incBtn) {
    incBtn.onclick = () => {
      if (currentQty < product.stock) {
        currentQty++;
        qtyVal.textContent = currentQty;
      }
    };
  }

  // Add to Bag
  const addBtn = document.getElementById('detail-add-cart-btn');
  if (addBtn && inStock) {
    addBtn.onclick = () => {
      addToCart(product, currentQty);
    };
  }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);
