/**
 * tilt3d.js - Subtle card depth and micro-interactions
 * Refined and understated without audio gimmicks or cursor distortion.
 */

function applyCardDepth(card) {
  if (!card || card.dataset.depthInitialized) return;
  card.dataset.depthInitialized = 'true';

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.2s ease, border-color 0.2s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}

function initCardInteractions() {
  document.querySelectorAll('.product-card, .hero-card').forEach(applyCardDepth);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && (node.classList.contains('product-card') || node.classList.contains('hero-card'))) {
            applyCardDepth(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.product-card, .hero-card').forEach(applyCardDepth);
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
