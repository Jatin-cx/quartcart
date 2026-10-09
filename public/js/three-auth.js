/**
 * three-auth.js - Interactive 3D WebGL Security Sphere for Login/Register Pages
 * Features an interactive rotating geometric security core with orbiting particle rings
 * that reacts to cursor positioning and hover physics.
 */

'use strict';

(function initAuth3D() {
  const container = document.getElementById('login-3d-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 520;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 6.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 40);
  cyanLight.position.set(4, 4, 5);
  scene.add(cyanLight);

  const blueLight = new THREE.PointLight(0x0072ff, 3.0, 40);
  blueLight.position.set(-4, -4, 4);
  scene.add(blueLight);

  // Core Group
  const group = new THREE.Group();
  scene.add(group);

  // 1. Central Faceted Security Vault Core (Octahedron / Icosahedron)
  const coreGeo = new THREE.OctahedronGeometry(1.6, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x060c18,
    emissive: 0x003366,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    flatShading: true,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. Wireframe Hologram Grid
  const wireGeo = new THREE.OctahedronGeometry(1.64, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireMesh);

  // 3. Orbiting Gyroscope Security Rings
  const ringGeo1 = new THREE.TorusGeometry(2.3, 0.025, 16, 80);
  const ringMat1 = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.4,
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(2.6, 0.02, 16, 80);
  const ringMat2 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.9,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  // 4. Energy Particle Dust
  const particleCount = 140;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i]     = (Math.random() - 0.5) * 10;
    particlePos[i + 1] = (Math.random() - 0.5) * 10;
    particlePos[i + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.65,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Interaction
  let targetRotationX = 0;
  let targetRotationY = 0;

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    targetRotationY = (x / rect.width) * 1.2;
    targetRotationX = -(y / rect.height) * 1.0;

    cyanLight.position.x = 4 + (x / rect.width) * 3;
    cyanLight.position.y = 4 - (y / rect.height) * 3;
  }

  window.addEventListener('mousemove', onMouseMove);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    group.rotation.y += (targetRotationY - group.rotation.y) * 0.05 + 0.006;
    group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

    ring1.rotation.z += 0.01;
    ring2.rotation.x += 0.012;

    coreMesh.position.y = Math.sin(time * 1.5) * 0.08;
    wireMesh.position.y = coreMesh.position.y;

    particles.rotation.y = time * 0.015;

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    const newW = container.clientWidth;
    const newH = container.clientHeight || 520;
    if (newW > 0 && newH > 0) {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
  });
})();

/**
 * Global helper to auto-populate test accounts on demo
 */
function fillDemoAccount(email, password) {
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  if (emailInput && passInput) {
    emailInput.value = email;
    passInput.value = password;
    if (typeof showToast === 'function') {
      showToast('Demo account credentials auto-filled. Signing in...', 'info', 2000);
    }
    const form = document.getElementById('login-form');
    if (form) {
      setTimeout(() => {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }, 400);
    }
  }
}
