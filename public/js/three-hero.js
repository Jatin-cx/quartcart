/**
 * three-hero.js - Interactive 3D WebGL Canvas for Quartcart Hero
 * Renders a futuristic metallic 3D artifact with orbiting rings & floating particles.
 * Interactive: Responds to mouse position, drag rotation, and hover light flare.
 */

(function initHero3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const width = container.clientWidth || 450;
  const height = container.clientHeight || 380;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x6366f1, 3.5, 50);
  cyanLight.position.set(5, 5, 5);
  scene.add(cyanLight);

  const magentaLight = new THREE.PointLight(0xec4899, 3.5, 50);
  magentaLight.position.set(-5, -3, 3);
  scene.add(magentaLight);

  const topRim = new THREE.DirectionalLight(0xffffff, 1.2);
  topRim.position.set(0, 10, 0);
  scene.add(topRim);

  // 3D Object Group
  const group = new THREE.Group();
  scene.add(group);

  // 1. Central Futuristic Core (Icosahedron / Faceted Crystal)
  const coreGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e1b4b,
    emissive: 0x312e81,
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    wireframe: false,
    flatShading: true,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. Wireframe Overlay for Cyberpunk Holographic Depth
  const wireGeo = new THREE.IcosahedronGeometry(1.83, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireMesh);

  // 3. Orbiting Gyroscope Rings
  const ringGeo1 = new THREE.TorusGeometry(2.5, 0.035, 16, 100);
  const ringMat1 = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x6366f1,
    emissiveIntensity: 0.5,
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(2.9, 0.025, 16, 100);
  const ringMat2 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  // 4. Floating 3D Particle Constellation
  const particleCount = 180;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i]     = (Math.random() - 0.5) * 12;
    particlePos[i + 1] = (Math.random() - 0.5) * 10;
    particlePos[i + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.06,
    color: 0xc7d2fe,
    transparent: true,
    opacity: 0.75,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Interaction Variables
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const rect = container.getBoundingClientRect();

  function onMouseMove(e) {
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    mouseX = (x / width) * 2;
    mouseY = -(y / height) * 2;

    targetRotationY = mouseX * 0.8;
    targetRotationX = mouseY * 0.6;

    // Shift point lights based on cursor for dynamic lighting reflection
    cyanLight.position.x = 4 + mouseX * 2;
    cyanLight.position.y = 4 + mouseY * 2;
  }

  container.addEventListener('mousemove', onMouseMove);

  // Interactive Drag-to-Rotate
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    group.rotation.y += deltaX * 0.01;
    group.rotation.x += deltaY * 0.01;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support for Mobile
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const x = touch.clientX - rect.left - width / 2;
      const y = touch.clientY - rect.top - height / 2;
      targetRotationY = (x / width) * 1.5;
      targetRotationX = -(y / height) * 1.2;
    }
  }, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    // Idle rotation + smooth interpolation towards mouse
    if (!isDragging) {
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05 + 0.008;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;
    }

    // Orbiting rings counter-rotation
    ring1.rotation.z += 0.012;
    ring2.rotation.x += 0.015;

    // Subtle levitation bobbing
    coreMesh.position.y = Math.sin(time * 1.5) * 0.12;
    wireMesh.position.y = coreMesh.position.y;

    // Gently drift particles
    particles.rotation.y = time * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // Responsive Resize
  window.addEventListener('resize', () => {
    const newW = container.clientWidth;
    const newH = container.clientHeight || 380;
    if (newW > 0 && newH > 0) {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
  });

})();
