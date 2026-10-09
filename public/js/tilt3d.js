/**
 * tilt3d.js - Physics-based 3D Card Tilt & Specular Reflection
 * Calculates cursor coordinates relative to cards and applies subtle 3D perspective transforms.
 */

'use strict';

function applyCardTilt(card) {
  if (!card || card.dataset.tiltInitialized) return;
  card.dataset.tiltInitialized = 'true';

  let bounds = card.getBoundingClientRect();

  function onMouseEnter() {
    bounds = card.getBoundingClientRect();
    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease, border-color 0.2s ease';
  }

  function onMouseMove(e) {
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const xPct = mouseX / bounds.width - 0.5;
    const yPct = mouseY / bounds.top - 0.5;

    const tiltX = (yPct * -12).toFixed(2);
    const tiltY = (xPct * 12).toFixed(2);

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    card.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 242, 254, 0.12)`;
    card.style.borderColor = 'rgba(0, 242, 254, 0.35)';
  }

  function onMouseLeave() {
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.boxShadow = '';
    card.style.borderColor = '';
  }

  card.addEventListener('mouseenter', onMouseEnter);
  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);
}

function initCardInteractions() {
  document.querySelectorAll('.product-card, .category-card').forEach(applyCardTilt);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && (node.classList.contains('product-card') || node.classList.contains('category-card'))) {
            applyCardTilt(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.product-card, .category-card').forEach(applyCardTilt);
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
