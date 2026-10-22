/**
 * three-hero.js - Interactive 3D Luxury Studio Headphone & Retail Pedestal Showcase
 * Renders an authentic 3D Studio Monitor Headphone in Ice Silver, Deep Aubergine,
 * and Radiant Marigold finishes over a 3D luxury pedestal.
 */

'use strict';

let currentHeadphoneTheme = 'silver';
let updateHeadphoneColorFn = null;

function initHero3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || typeof THREE === 'undefined') return;

  container.querySelectorAll('canvas').forEach((c) => c.remove());

  const width = container.clientWidth || 540;
  const height = container.clientHeight || 460;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0.25, 7.8);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  // Ice Silver & Marigold Luxury Retail Lighting
  const ambientLight = new THREE.AmbientLight(0x1a0f26, 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xe2e8f0, 2.6);
  keyLight.position.set(6, 9, 6);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xf59e0b, 3.4, 40);
  fillLight.position.set(-5, 1, 5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xf8fafc, 2.0);
  rimLight.position.set(0, 5, -6);
  scene.add(rimLight);

  // Root Stage
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  const headphoneGroup = new THREE.Group();
  stageGroup.add(headphoneGroup);

  // Luxury Finishes (Default: Ice Silver Metallic, Deep Aubergine Leather, Radiant Marigold Accents)
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.16,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
  });

  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x1a0f26,
    roughness: 0.65,
    metalness: 0.18,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.16,
    emissive: 0xb45309,
    emissiveIntensity: 0.25,
  });

  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0x12091c,
    roughness: 0.25,
    metalness: 0.82,
  });

  // 3D Aubergine & Silver Turntable Pedestal Base beneath Headphones
  const pedestalGroup = new THREE.Group();
  const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.5, 0.24, 64), marbleMat);
  baseDisc.position.y = -2.1;
  pedestalGroup.add(baseDisc);

  const silverRimMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.15,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.3,
  });

  const silverRim = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.04, 16, 64), silverRimMat);
  silverRim.rotation.x = Math.PI / 2;
  silverRim.position.y = -1.98;
  pedestalGroup.add(silverRim);

  const floatingHalo = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.025, 12, 64), goldAccentMat);
  floatingHalo.rotation.x = Math.PI / 2;
  floatingHalo.position.y = -1.82;
  pedestalGroup.add(floatingHalo);

  stageGroup.add(pedestalGroup);

  // A. Headband Arch
  const archGeo = new THREE.TorusGeometry(1.9, 0.11, 20, 64, Math.PI);
  const archMesh = new THREE.Mesh(archGeo, metalMat);
  archMesh.rotation.z = Math.PI;
  archMesh.position.y = 0.55;
  headphoneGroup.add(archMesh);

  // B. Leather Cushion Under Headband
  const padGeo = new THREE.TorusGeometry(1.81, 0.095, 16, 48, Math.PI * 0.75);
  const padMesh = new THREE.Mesh(padGeo, cushionMat);
  padMesh.rotation.z = Math.PI * 1.125;
  padMesh.position.y = 0.55;
  headphoneGroup.add(padMesh);

  function createEarcupAssembly(isLeft = true) {
    const sideGroup = new THREE.Group();
    const xOffset = isLeft ? -1.9 : 1.9;
    sideGroup.position.set(xOffset, 0.45, 0);

    const sliderGeo = new THREE.BoxGeometry(0.14, 0.9, 0.22);
    const sliderMesh = new THREE.Mesh(sliderGeo, goldAccentMat);
    sliderMesh.position.y = -0.4;
    sideGroup.add(sliderMesh);

    const yokeGeo = new THREE.TorusGeometry(0.75, 0.068, 16, 32, Math.PI);
    const yokeMesh = new THREE.Mesh(yokeGeo, goldAccentMat);
    yokeMesh.position.y = -0.85;
    sideGroup.add(yokeMesh);

    const cupGroup = new THREE.Group();
    cupGroup.position.y = -0.85;

    const shellGeo = new THREE.CylinderGeometry(0.86, 0.78, 0.44, 40);
    const shellMesh = new THREE.Mesh(shellGeo, metalMat);
    shellMesh.rotation.z = Math.PI / 2;
    cupGroup.add(shellMesh);

    const capGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.09, 40);
    const capMesh = new THREE.Mesh(capGeo, metalMat);
    capMesh.rotation.z = Math.PI / 2;
    capMesh.position.x = isLeft ? -0.22 : 0.22;
    cupGroup.add(capMesh);

    const ringGeo = new THREE.TorusGeometry(0.65, 0.03, 16, 44);
    const ringMesh = new THREE.Mesh(ringGeo, goldAccentMat);
    ringMesh.rotation.y = Math.PI / 2;
    ringMesh.position.x = isLeft ? -0.25 : 0.25;
    cupGroup.add(ringMesh);

    const earPadGeo = new THREE.TorusGeometry(0.68, 0.24, 18, 36);
    const earPadMesh = new THREE.Mesh(earPadGeo, cushionMat);
    earPadMesh.rotation.y = Math.PI / 2;
    earPadMesh.position.x = isLeft ? 0.22 : -0.22;
    cupGroup.add(earPadMesh);

    cupGroup.rotation.y = isLeft ? 0.08 : -0.08;
    sideGroup.add(cupGroup);

    return sideGroup;
  }

  headphoneGroup.add(createEarcupAssembly(true));
  headphoneGroup.add(createEarcupAssembly(false));

  headphoneGroup.rotation.y = -0.35;
  headphoneGroup.rotation.x = 0.14;
  headphoneGroup.position.y = 0.15;

  // Colorway Switcher
  updateHeadphoneColorFn = function (theme) {
    currentHeadphoneTheme = theme;
    if (theme === 'silver' || theme === 'obsidian') {
      // Ice Silver Metallic Body, Deep Aubergine Cushions & Radiant Marigold Accents
      metalMat.color.setHex(0xe2e8f0);
      cushionMat.color.setHex(0x1a0f26);
      goldAccentMat.color.setHex(0xf59e0b);
      fillLight.color.setHex(0xf59e0b);
    } else if (theme === 'aubergine' || theme === 'titanium') {
      // Deep Aubergine Metallic Body, Dark Velvet Cushions & Ice Silver Trim
      metalMat.color.setHex(0x251536);
      cushionMat.color.setHex(0x12091c);
      goldAccentMat.color.setHex(0xe2e8f0);
      fillLight.color.setHex(0xa855f7);
    } else if (theme === 'marigold' || theme === 'cyan') {
      // Radiant Marigold Metallic Body, Deep Aubergine Cushions & Ice Silver Accent
      metalMat.color.setHex(0xf59e0b);
      cushionMat.color.setHex(0x1a0f26);
      goldAccentMat.color.setHex(0xe2e8f0);
      fillLight.color.setHex(0xfbbf24);
    }
  };

  let targetRotationY = -0.35;
  let targetRotationX = 0.14;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  container.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    targetRotationY = -0.35 + (x / rect.width) * 0.95;
    targetRotationX = 0.14 - (y / rect.height) * 0.5;
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
    targetRotationY = headphoneGroup.rotation.y;
    targetRotationX = headphoneGroup.rotation.x;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (!isDragging) {
      targetRotationY += 0.0045;
      headphoneGroup.rotation.y += (targetRotationY - headphoneGroup.rotation.y) * 0.06;
      headphoneGroup.rotation.x += (targetRotationX - headphoneGroup.rotation.x) * 0.06;
      headphoneGroup.position.y = 0.18 + Math.sin(time * 2.0) * 0.08;
      floatingHalo.position.y = -1.82 + Math.cos(time * 2.0) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    const newW = container.clientWidth || 540;
    const newH = container.clientHeight || 460;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  });
}

window.setHeadphoneColorway = function (theme, btnEl) {
  if (updateHeadphoneColorFn) {
    updateHeadphoneColorFn(theme);
  }
  document.querySelectorAll('.colorway-btn').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
};

document.addEventListener('DOMContentLoaded', initHero3D);
