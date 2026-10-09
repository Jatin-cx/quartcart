/**
 * tilt3d.js — Real 3D Perspective Tilt, Specular Glare, Cursor Spotlight & Cybernetic Audio FX
 * Elevates the Quartcart storefront into an interactive, spatial 3D experience.
 */

// ─── Web Audio API Cybernetic Sound Synth ────────────────────
const SoundFX = {
  ctx: null,
  enabled: localStorage.getItem('quartcart_sound_fx') !== 'false',

  init() {
    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('quartcart_sound_fx', this.enabled ? 'true' : 'false');
    this.updatePillUI();
    if (this.enabled) {
      this.playSuccess();
    }
    return this.enabled;
  },

  updatePillUI() {
    const pill = document.getElementById('sound-toggle-pill');
    if (!pill) return;
    if (this.enabled) {
      pill.classList.add('active');
      pill.innerHTML = `
        <span class="sound-indicator"></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <span>Sound FX</span>
      `;
    } else {
      pill.classList.remove('active');
      pill.innerHTML = `
        <span class="sound-indicator"></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <span>Muted</span>
      `;
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

// ─── 3D Card & Object Gyroscope + Specular Glare Engine ───────
function apply3DTilt(card) {
  if (!card || card.dataset.tiltInitialized) return;
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

  const maxTilt = card.classList.contains('gallery-main') ? 8 : 14;
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

// ─── Ambient Cursor Spotlight Glow ───────────────────────────
function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return; // Skip on touch-only devices
  if (document.querySelector('.ambient-cursor-glow')) return;

  const glow = document.createElement('div');
  glow.className = 'ambient-cursor-glow';
  document.body.appendChild(glow);

  let mouseX = -500;
  let mouseY = -500;
  let currentX = -500;
  let currentY = -500;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function renderGlow() {
    // Smooth lerp interpolation for silky motion
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    glow.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
    requestAnimationFrame(renderGlow);
  }

  requestAnimationFrame(renderGlow);
}

// ─── Floating Sound FX Controller Pill ───────────────────────
function initAudioPill() {
  if (document.getElementById('sound-toggle-pill')) return;

  const pill = document.createElement('button');
  pill.id = 'sound-toggle-pill';
  pill.className = 'sound-toggle-pill';
  pill.setAttribute('aria-label', 'Toggle Sound Effects');
  document.body.appendChild(pill);

  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    SoundFX.toggle();
  });

  SoundFX.updatePillUI();
}

// ─── Main Tilt & FX Initializer ─────────────────────────────
function initTiltSystem() {
  document.querySelectorAll('.product-card, .hero-card, .gallery-main').forEach(apply3DTilt);

  // MutationObserver for products loaded dynamically via AJAX
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && (node.classList.contains('product-card') || node.classList.contains('hero-card') || node.classList.contains('gallery-main'))) {
            apply3DTilt(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.product-card, .hero-card, .gallery-main').forEach(apply3DTilt);
          }
        }
      });
    });
  });

  const observeTarget = document.querySelector('main') || document.body;
  observer.observe(observeTarget, { childList: true, subtree: true });

  // Hook tactile audio feedback to user actions
  document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart-btn') || e.target.closest('#detail-add-cart-btn')) {
      SoundFX.playSuccess();
    } else if (e.target.closest('.btn') || e.target.closest('.filter-chip') || e.target.closest('.password-toggle-btn')) {
      SoundFX.playChirp(720, 'sine', 0.05);
    }
  });

  initCursorGlow();
  initAudioPill();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTiltSystem);
} else {
  initTiltSystem();
}
