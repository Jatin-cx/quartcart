/**
 * tilt3d.js - Physics-based 3D Card Tilt, Specular Glare & Parallax Depth
 * Elevates cards in 3D perspective space and computes dynamic surface lighting reflections.
 */

'use strict';

function applyCardTilt(card) {
  if (!card || card.dataset.tiltInitialized) return;
  card.dataset.tiltInitialized = 'true';

  // Inject specular glare layer if not present
  let glare = card.querySelector('.product-card-glare');
  if (!glare && card.classList.contains('product-card')) {
    glare = document.createElement('div');
    glare.className = 'product-card-glare';
    card.appendChild(glare);
  }

  const imgWrapper = card.querySelector('.product-card-img-wrapper') || card.querySelector('.category-tile-img-box');

  function onMouseEnter() {
    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease, border-color 0.2s ease';
    if (glare) glare.style.opacity = '1';
  }

  function onMouseMove(e) {
    const bounds = card.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const xPct = mouseX / bounds.width;
    const yPct = mouseY / bounds.height;

    // Smooth tilt angles (-14 to +14 deg)
    const tiltX = ((yPct - 0.5) * -14).toFixed(2);
    const tiltY = ((xPct - 0.5) * 14).toFixed(2);

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 22px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 242, 254, 0.2)`;
    card.style.borderColor = 'rgba(0, 242, 254, 0.45)';

    // Update dynamic specular reflection position
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(xPct * 100).toFixed(1)}% ${(yPct * 100).toFixed(1)}%, rgba(0, 242, 254, 0.28) 0%, transparent 60%)`;
    }

    // 3D Parallax lift on product image
    if (imgWrapper) {
      imgWrapper.style.transform = `translateZ(24px)`;
    }
  }

  function onMouseLeave() {
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
    card.style.boxShadow = '';
    card.style.borderColor = '';
    if (glare) glare.style.opacity = '0';

    if (imgWrapper) {
      imgWrapper.style.transform = 'translateZ(0)';
    }
  }

  card.addEventListener('mouseenter', onMouseEnter);
  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);
}

function initCardInteractions() {
  document.querySelectorAll('.product-card, .category-tile-3d, .hero-studio-card').forEach(applyCardTilt);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && (node.classList.contains('product-card') || node.classList.contains('category-tile-3d'))) {
            applyCardTilt(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.product-card, .category-tile-3d').forEach(applyCardTilt);
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
