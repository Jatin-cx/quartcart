/**
 * three-hero.js - Interactive 3D Luxury Studio Headphone Showcase
 * Renders an ultra-realistic 3D Studio Monitor Headphone with machined aluminum yokes,
 * acoustic ear cushions, and dynamic multi-point studio lighting.
 * Features 360-degree drag rotation, cursor physics, and live colorway switching.
 */

'use strict';

let currentHeadphoneTheme = 'obsidian';
let updateHeadphoneColorFn = null;

function initHero3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || typeof THREE === 'undefined') return;

  // Clear previous canvas if any
  container.querySelectorAll('canvas').forEach((c) => c.remove());

  const width = container.clientWidth || 540;
  const height = container.clientHeight || 460;

  // 1. Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  // 2. Renderer with High-End Color Tone Mapping
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // 3. Studio Lighting Rig
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Top Key Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  // Cool Cyan Fill Light
  const fillLight = new THREE.PointLight(0x00f2fe, 3.2, 40);
  fillLight.position.set(-5, -2, 4);
  scene.add(fillLight);

  // Rim / Backlight for Metallic Edges
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
  rimLight.position.set(0, 4, -6);
  scene.add(rimLight);

  // 4. Build 3D Realistic Headphone Model
  const headphoneGroup = new THREE.Group();
  scene.add(headphoneGroup);

  // Base Materials
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0x14161d,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
  });

  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d12,
    roughness: 0.8,
    metalness: 0.1,
  });

  const accentRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.85,
  });

  // A. Headband Arch (Curved Torus Arc)
  const archGeo = new THREE.TorusGeometry(1.9, 0.1, 16, 64, Math.PI);
  const archMesh = new THREE.Mesh(archGeo, metalMat);
  archMesh.rotation.z = Math.PI; // Arch up
  archMesh.position.y = 0.5;
  headphoneGroup.add(archMesh);

  // B. Soft Leather Cushion Under Headband
  const padGeo = new THREE.TorusGeometry(1.82, 0.09, 16, 48, Math.PI * 0.75);
  const padMesh = new THREE.Mesh(padGeo, cushionMat);
  padMesh.rotation.z = Math.PI * 1.125;
  padMesh.position.y = 0.5;
  headphoneGroup.add(padMesh);

  // Helper function to build an earcup assembly
  function createEarcupAssembly(isLeft = true) {
    const sideGroup = new THREE.Group();
    const xOffset = isLeft ? -1.9 : 1.9;
    sideGroup.position.set(xOffset, 0.4, 0);

    // 1. Vertical Slider Arm
    const sliderGeo = new THREE.BoxGeometry(0.14, 0.9, 0.22);
    const sliderMesh = new THREE.Mesh(sliderGeo, metalMat);
    sliderMesh.position.y = -0.4;
    sideGroup.add(sliderMesh);

    // 2. Yoke Pivot Fork
    const yokeGeo = new THREE.TorusGeometry(0.75, 0.065, 16, 32, Math.PI);
    const yokeMesh = new THREE.Mesh(yokeGeo, metalMat);
    yokeMesh.rotation.z = 0; // Curve down
    yokeMesh.position.y = -0.85;
    sideGroup.add(yokeMesh);

    // 3. Earcup Group
    const cupGroup = new THREE.Group();
    cupGroup.position.y = -0.85;

    // Main Outer Shell
    const shellGeo = new THREE.CylinderGeometry(0.85, 0.78, 0.42, 36);
    const shellMesh = new THREE.Mesh(shellGeo, metalMat);
    shellMesh.rotation.z = Math.PI / 2;
    cupGroup.add(shellMesh);

    // Outer Center Brushed Cap
    const capGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.08, 36);
    const capMesh = new THREE.Mesh(capGeo, metalMat);
    capMesh.rotation.z = Math.PI / 2;
    capMesh.position.x = isLeft ? -0.22 : 0.22;
    cupGroup.add(capMesh);

    // Glowing Laser Accent Ring
    const ringGeo = new THREE.TorusGeometry(0.64, 0.02, 16, 40);
    const ringMesh = new THREE.Mesh(ringGeo, accentRingMat);
    ringMesh.rotation.y = Math.PI / 2;
    ringMesh.position.x = isLeft ? -0.25 : 0.25;
    cupGroup.add(ringMesh);

    // Soft Memory Foam Ear Pad (Inward Facing)
    const earPadGeo = new THREE.TorusGeometry(0.68, 0.24, 16, 32);
    const earPadMesh = new THREE.Mesh(earPadGeo, cushionMat);
    earPadMesh.rotation.y = Math.PI / 2;
    earPadMesh.position.x = isLeft ? 0.22 : -0.22;
    cupGroup.add(earPadMesh);

    // Subtle Angle for Ergonomic Fit
    cupGroup.rotation.y = isLeft ? 0.08 : -0.08;
    sideGroup.add(cupGroup);

    return sideGroup;
  }

  const leftEarcup = createEarcupAssembly(true);
  const rightEarcup = createEarcupAssembly(false);
  headphoneGroup.add(leftEarcup);
  headphoneGroup.add(rightEarcup);

  // Subtle initial showcase tilt
  headphoneGroup.rotation.y = -0.35;
  headphoneGroup.rotation.x = 0.15;
  headphoneGroup.position.y = 0.1;

  // 5. Theme / Colorway Switcher
  updateHeadphoneColorFn = function (theme) {
    currentHeadphoneTheme = theme;
    if (theme === 'obsidian') {
      metalMat.color.setHex(0x14161d);
      metalMat.roughness = 0.18;
      accentRingMat.color.setHex(0x00f2fe);
      fillLight.color.setHex(0x00f2fe);
    } else if (theme === 'titanium') {
      metalMat.color.setHex(0x94a3b8);
      metalMat.roughness = 0.25;
      accentRingMat.color.setHex(0xffffff);
      fillLight.color.setHex(0x38bdf8);
    } else if (theme === 'cyan') {
      metalMat.color.setHex(0x0891b2);
      metalMat.roughness = 0.15;
      accentRingMat.color.setHex(0x00f2fe);
      fillLight.color.setHex(0x00f2fe);
    }
  };

  // 6. User Interaction (Mouse & Drag)
  let targetRotationY = -0.35;
  let targetRotationX = 0.15;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  container.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    targetRotationY = -0.35 + (x / rect.width) * 0.9;
    targetRotationX = 0.15 - (y / rect.height) * 0.5;

    // Shift key light slightly for reactive sheen
    keyLight.position.x = 5 + (x / rect.width) * 3;
    keyLight.position.y = 8 - (y / rect.height) * 2;
  });

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;

    headphoneGroup.rotation.y += deltaX * 0.012;
    headphoneGroup.rotation.x += deltaY * 0.012;

    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left - rect.width / 2;
      const y = touch.clientY - rect.top - rect.height / 2;
      targetRotationY = -0.35 + (x / rect.width) * 1.2;
      targetRotationX = 0.15 - (y / rect.height) * 0.8;
    }
  }, { passive: true });

  // 7. Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (!isDragging) {
      // Smooth lerp towards target rotation + subtle breathing float
      headphoneGroup.rotation.y += (targetRotationY - headphoneGroup.rotation.y) * 0.06;
      headphoneGroup.rotation.x += (targetRotationX - headphoneGroup.rotation.x) * 0.06;
      headphoneGroup.position.y = 0.1 + Math.sin(time * 1.8) * 0.06;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    const newW = container.clientWidth;
    const newH = container.clientHeight || 460;
    if (newW > 0 && newH > 0) {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
  });
}

// Global hook to switch colorway from HTML buttons
function setHeadphoneColorway(theme, btnEl) {
  if (typeof updateHeadphoneColorFn === 'function') {
    updateHeadphoneColorFn(theme);
  }
  document.querySelectorAll('.colorway-btn').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initHero3D);
