/**
 * three-shopping-auth.js - Interactive 3D Luxury Shopping Bag & Gift Pedestal
 * For Login & Sign Up pages: renders an authentic 3D retail shopping bag,
 * wrapped gift box, and golden member tag on a warm studio turntable.
 */

'use strict';

(function initShoppingAuth3D() {
  function bootAuthStage() {
    const container = document.getElementById('auth-shopping-3d-stage');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 440;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 6.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Retail Studio Lighting
    const ambient = new THREE.AmbientLight(0xfff6ec, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff0dd, 1.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const warmPoint = new THREE.PointLight(0xe04f33, 2.2, 20);
    warmPoint.position.set(-4, 3, 4);
    scene.add(warmPoint);

    const goldPoint = new THREE.PointLight(0xf59e0b, 2.0, 20);
    goldPoint.position.set(4, -2, 5);
    scene.add(goldPoint);

    // Root Turntable Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Materials
    const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xe04f33,
      roughness: 0.32,
      metalness: 0.12
    });
    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xfffaf2,
      roughness: 0.4,
      metalness: 0.05
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.22,
      metalness: 0.88
    });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.35,
      metalness: 0.15
    });

    // 1. Studio Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(2.1, 2.25, 0.22, 48);
    const pedestal = new THREE.Mesh(pedestalGeo, creamMat);
    pedestal.position.y = -1.25;
    stageGroup.add(pedestal);

    const rimGeo = new THREE.TorusGeometry(2.15, 0.035, 16, 64);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -1.14;
    stageGroup.add(rim);

    // 2. Hero Luxury Shopping Bag (Center-Left)
    const bagGroup = new THREE.Group();
    const bagBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.75, 0.72), terracottaMat);
    bagGroup.add(bagBody);

    const bagTopCuff = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.2, 0.76), goldMat);
    bagTopCuff.position.y = 0.78;
    bagGroup.add(bagTopCuff);

    const bagBadge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.34, 0.05), creamMat);
    bagBadge.position.set(0, 0.12, 0.37);
    bagGroup.add(bagBadge);

    const handleGeo = new THREE.TorusGeometry(0.36, 0.05, 14, 32, Math.PI);
    const handleF = new THREE.Mesh(handleGeo, goldMat);
    handleF.position.set(0, 0.88, 0.2);
    bagGroup.add(handleF);

    const handleB = new THREE.Mesh(handleGeo, goldMat);
    handleB.position.set(0, 0.88, -0.2);
    bagGroup.add(handleB);

    bagGroup.position.set(-0.45, -0.22, 0);
    bagGroup.rotation.y = 0.28;
    stageGroup.add(bagGroup);

    // 3. Companion Wrapped Gift Box (Right)
    const giftGroup = new THREE.Group();
    const giftBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 1.05), emeraldMat);
    giftGroup.add(giftBase);

    const giftLid = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.2, 1.12), emeraldMat);
    giftLid.position.y = 0.42;
    giftGroup.add(giftLid);

    const ribA = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.02, 0.16), goldMat);
    ribA.position.y = 0.02;
    giftGroup.add(ribA);

    const ribB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.02, 1.14), goldMat);
    ribB.position.y = 0.02;
    giftGroup.add(ribB);

    giftGroup.position.set(0.85, -0.62, 0.45);
    giftGroup.rotation.y = -0.35;
    stageGroup.add(giftGroup);

    // 4. Floating Golden Member Card (Top Right)
    const cardGroup = new THREE.Group();
    const cardMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.06), goldMat);
    cardGroup.add(cardMesh);
    const chipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.08), creamMat);
    chipMesh.position.set(-0.32, 0.05, 0);
    cardGroup.add(chipMesh);
    cardGroup.position.set(0.95, 0.65, -0.2);
    cardGroup.rotation.set(0.15, -0.4, 0.12);
    stageGroup.add(cardGroup);

    // Drag & Hover Rotation
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;
    let targetRotX = 0.08;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        targetRotY += dx * 0.012;
        prevX = e.clientX;
      }
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!isDragging) {
        targetRotY += 0.006;
      }

      stageGroup.rotation.y += (targetRotY - stageGroup.rotation.y) * 0.08;
      stageGroup.rotation.x += (targetRotX - stageGroup.rotation.x) * 0.08;

      // Gentle 3D floating bob
      bagGroup.position.y = -0.22 + Math.sin(t * 1.8) * 0.06;
      giftGroup.position.y = -0.62 + Math.cos(t * 2.1) * 0.05;
      cardGroup.position.y = 0.65 + Math.sin(t * 2.5 + 1) * 0.1;
      cardGroup.rotation.z = 0.12 + Math.sin(t * 1.5) * 0.06;

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      const w = container.clientWidth || 440;
      const h = container.clientHeight || 240;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  if (typeof THREE !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootAuthStage);
    } else {
      bootAuthStage();
    }
  } else {
    window.addEventListener('load', bootAuthStage);
  }
})();
