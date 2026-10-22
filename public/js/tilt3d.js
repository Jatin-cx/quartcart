/**
 * tilt3d.js - Multi-Layer 3D Perspective Physics, Z-Axis Extrusion & Warm Studio Glare
 * Transforms cards, product tiles, trust boxes, and panels into tactile 3D objects.
 */

'use strict';

function applyCardTilt(card) {
  if (!card || card.dataset.tiltInitialized) return;
  card.dataset.tiltInitialized = 'true';

  card.style.transformStyle = 'preserve-3d';

  let glare = card.querySelector('.product-card-glare');
  if (!glare) {
    glare = document.createElement('div');
    glare.className = 'product-card-glare';
    card.appendChild(glare);
  }

  const imgWrapper =
    card.querySelector('.product-card-img-wrapper') ||
    card.querySelector('.category-tile-img-box') ||
    card.querySelector('.trust-icon-box');

  const bodyEl =
    card.querySelector('.product-card-body') ||
    card.querySelector('.category-tile-title-row');

  const footerEl = card.querySelector('.product-card-footer');
  const badgeEl = card.querySelector('.featured-badge');

  function onMouseEnter() {
    card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';
    if (glare) glare.style.opacity = '1';
  }

  function onMouseMove(e) {
    const bounds = card.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const xPct = mouseX / bounds.width;
    const yPct = mouseY / bounds.height;

    const maxTilt = card.classList.contains('auth-card-panel') || card.classList.contains('auth-perks-card') ? 5 : 13;
    const tiltX = ((yPct - 0.5) * -maxTilt).toFixed(2);
    const tiltY = ((xPct - 0.5) * maxTilt).toFixed(2);

    card.style.transform = `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 28px 55px -10px rgba(0, 0, 0, 0.85), 0 12px 24px -6px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255, 42, 133, 0.35)`;
    card.style.borderColor = 'rgba(14, 165, 233, 0.65)';

    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(xPct * 100).toFixed(1)}% ${(yPct * 100).toFixed(1)}%, rgba(14, 165, 233, 0.35) 0%, rgba(255, 42, 133, 0.22) 35%, transparent 68%)`;
    }

    if (imgWrapper) {
      imgWrapper.style.transform = 'translateZ(36px)';
      imgWrapper.style.transition = 'transform 0.2s ease-out';
    }
    if (bodyEl) {
      bodyEl.style.transform = 'translateZ(24px)';
      bodyEl.style.transition = 'transform 0.2s ease-out';
    }
    if (footerEl) {
      footerEl.style.transform = 'translateZ(38px)';
      footerEl.style.transition = 'transform 0.2s ease-out';
    }
    if (badgeEl) {
      badgeEl.style.transform = 'translateZ(50px)';
      badgeEl.style.transition = 'transform 0.2s ease-out';
    }
  }

  function onMouseLeave() {
    card.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.55s ease, border-color 0.55s ease';
    card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    card.style.boxShadow = '';
    card.style.borderColor = '';
    if (glare) glare.style.opacity = '0';

    if (imgWrapper) imgWrapper.style.transform = 'translateZ(0)';
    if (bodyEl) bodyEl.style.transform = 'translateZ(0)';
    if (footerEl) footerEl.style.transform = 'translateZ(0)';
    if (badgeEl) badgeEl.style.transform = 'translateZ(0)';
  }

  card.addEventListener('mouseenter', onMouseEnter);
  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);
}

const TILT_SELECTORS = [
  '.product-card',
  '.category-tile-3d',
  '.hero-studio-card',
  '.trust-item',
  '.auth-perks-card',
  '.auth-card-panel',
  '.card',
  '.cart-summary-card'
].join(', ');

function initCardInteractions() {
  document.querySelectorAll(TILT_SELECTORS).forEach(applyCardTilt);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches(TILT_SELECTORS)) {
            applyCardTilt(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll(TILT_SELECTORS).forEach(applyCardTilt);
          }
        }
      });
    });
  });

  const target = document.querySelector('main') || document.body;
  observer.observe(target, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardInteractions);
} else {
  initCardInteractions();
}
