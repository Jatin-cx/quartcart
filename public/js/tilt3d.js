/**
 * tilt3d.js — Real 3D Perspective Tilt, Specular Glare & Cybernetic Audio FX
 * Transforms flat 2D cards into interactive 3D objects with depth and lighting reflections.
 */

// ─── Web Audio API Cybernetic Sound Synth ────────────────────
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  playChirp(freq = 880, type = 'sine', duration = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') {
        this.ctx && this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  },

  playSuccess() {
    this.playChirp(523.25, 'triangle', 0.08); // C5
    setTimeout(() => this.playChirp(659.25, 'triangle', 0.1), 60); // E5
    setTimeout(() => this.playChirp(783.99, 'sine', 0.16), 120); // G5
  }
};

// ─── 3D Card Gyroscope & Specular Glare Engine ──────────────
function apply3DTilt(card) {
  if (card.dataset.tiltInitialized) return;
  card.dataset.tiltInitialized = 'true';

  card.style.transformStyle = 'preserve-3d';
  card.style.perspective = '1000px';

  // Create Specular Glare Overlay
  let glare = card.querySelector('.glare-overlay');
  if (!glare) {
    glare = document.createElement('div');
    glare.className = 'glare-overlay';
    card.appendChild(glare);
  }

  const maxTilt = 14; // Degrees
  let rect = card.getBoundingClientRect();

  function updateRect() {
    rect = card.getBoundingClientRect();
  }

  window.addEventListener('scroll', updateRect, { passive: true });
  window.addEventListener('resize', updateRect, { passive: true });

  card.addEventListener('mouseenter', () => {
    updateRect();
    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
  });

  card.addEventListener('mousemove', (e) => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 2 - 1;
    const yPercent = (y / rect.height) * 2 - 1;

    const rotX = -yPercent * maxTilt;
    const rotY = xPercent * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
    card.style.boxShadow = `
      ${-rotY * 2}px ${rotX * 2 + 15}px 35px -10px rgba(0, 0, 0, 0.7),
      0 0 35px rgba(99, 102, 241, 0.25)
    `;

    // Specular Glare Reflection Sheen
    glare.style.opacity = '1';
    glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = '';
    glare.style.opacity = '0';
  });
}

/**
 * Initialize 3D tilt on all existing cards and observe new dynamic cards
 */
function initTiltSystem() {
  document.querySelectorAll('.product-card, .hero-card').forEach(apply3DTilt);

  // MutationObserver for products loaded dynamically via AJAX
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && (node.classList.contains('product-card') || node.classList.contains('hero-card'))) {
            apply3DTilt(node);
          }
          node.querySelectorAll && node.querySelectorAll('.product-card, .hero-card').forEach(apply3DTilt);
        }
      });
    });
  });

  const grid = document.getElementById('products-grid') || document.getElementById('featured-products-grid');
  if (grid) {
    observer.observe(grid, { childList: true, subtree: true });
  }

  // Hook tactile sound to Add To Bag buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart-btn') || e.target.closest('#detail-add-cart-btn')) {
      SoundFX.playSuccess();
    } else if (e.target.closest('.btn') || e.target.closest('.filter-chip')) {
      SoundFX.playChirp(700, 'sine', 0.05);
    }
  });
}

document.addEventListener('DOMContentLoaded', initTiltSystem);
