/**
 * bg-3d.js - Full-Viewport Interactive 3D Retail Showroom Background
 * Renders floating 3D shopping bags, wrapped gift boxes, brushed gold rings,
 * and warm ceramic spheres that respond to mouse parallax and page scroll.
 */

'use strict';

(function initRetail3DBackground() {
  function bootScene() {
    if (typeof THREE === 'undefined') return;
    if (document.getElementById('retail-3d-bg-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'retail-3d-bg-canvas';
    canvas.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'pointer-events: none',
      'z-index: 0',
      'opacity: 0.92'
    ].join(';');
    document.body.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf6efe4, 0.028);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    // Warm Luxury Retail Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e8, 1.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffdfba, 1.6);
    sunLight.position.set(10, 16, 12);
    scene.add(sunLight);

    const coralLight = new THREE.PointLight(0xe04f33, 2.2, 45);
    coralLight.position.set(-12, 8, 8);
    scene.add(coralLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.0, 45);
    goldLight.position.set(12, -8, 10);
    scene.add(goldLight);

    const tealLight = new THREE.PointLight(0x0d9488, 1.4, 40);
    tealLight.position.set(0, 10, -8);
    scene.add(tealLight);

    // Shared Retail Materials
    const bagMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xe04f33, roughness: 0.35, metalness: 0.1 }), // Terracotta
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.2 }),  // Warm Amber Gold
      new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4, metalness: 0.1 }),  // Botanical Emerald
      new THREE.MeshStandardMaterial({ color: 0xfff8ef, roughness: 0.45, metalness: 0.05 }), // Cream Ivory
      new THREE.MeshStandardMaterial({ color: 0xc23b22, roughness: 0.35, metalness: 0.15 })  // Crimson Clay
    ];

    const goldRibbonMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.85
    });

    const creamRibbonMat = new THREE.MeshStandardMaterial({
      color: 0xfffaf0,
      roughness: 0.3,
      metalness: 0.1
    });

    /**
     * Build a 3D Shopping Bag mesh group
     */
    function createShoppingBag(mat) {
      const bagGroup = new THREE.Group();

      // Main bag body (tapered box appearance)
      const bodyGeo = new THREE.BoxGeometry(1.3, 1.55, 0.58);
      const bodyMesh = new THREE.Mesh(bodyGeo, mat);
      bagGroup.add(bodyMesh);

      // Top cuff fold accent
      const cuffGeo = new THREE.BoxGeometry(1.34, 0.18, 0.62);
      const cuffMesh = new THREE.Mesh(cuffGeo, goldRibbonMat);
      cuffMesh.position.y = 0.7;
      bagGroup.add(cuffMesh);

      // Front emblem tag
      const tagGeo = new THREE.BoxGeometry(0.45, 0.25, 0.04);
      const tagMesh = new THREE.Mesh(tagGeo, creamRibbonMat);
      tagMesh.position.set(0, 0.1, 0.3);
      bagGroup.add(tagMesh);

      // Arched Handles (Front & Back)
      const handleGeo = new THREE.TorusGeometry(0.32, 0.045, 12, 28, Math.PI);
      const handleFront = new THREE.Mesh(handleGeo, goldRibbonMat);
      handleFront.position.set(0, 0.78, 0.18);
      bagGroup.add(handleFront);

      const handleBack = new THREE.Mesh(handleGeo, goldRibbonMat);
      handleBack.position.set(0, 0.78, -0.18);
      bagGroup.add(handleBack);

      return bagGroup;
    }

    /**
     * Build a 3D Wrapped Gift Box mesh group
     */
    function createGiftBox(mat) {
      const boxGroup = new THREE.Group();

      const baseGeo = new THREE.BoxGeometry(1.2, 1.05, 1.2);
      const baseMesh = new THREE.Mesh(baseGeo, mat);
      boxGroup.add(baseMesh);

      const lidGeo = new THREE.BoxGeometry(1.28, 0.24, 1.28);
      const lidMesh = new THREE.Mesh(lidGeo, mat);
      lidMesh.position.y = 0.48;
      boxGroup.add(lidMesh);

      // Cross Ribbons
      const rib1Geo = new THREE.BoxGeometry(1.3, 1.12, 0.18);
      const rib1 = new THREE.Mesh(rib1Geo, goldRibbonMat);
      rib1.position.y = 0.04;
      boxGroup.add(rib1);

      const rib2Geo = new THREE.BoxGeometry(0.18, 1.12, 1.3);
      const rib2 = new THREE.Mesh(rib2Geo, goldRibbonMat);
      rib2.position.y = 0.04;
      boxGroup.add(rib2);

      // Top Bow Loops
      const bowLoopGeo = new THREE.TorusGeometry(0.18, 0.04, 10, 20);
      const loopLeft = new THREE.Mesh(bowLoopGeo, goldRibbonMat);
      loopLeft.position.set(-0.15, 0.72, 0);
      loopLeft.rotation.z = Math.PI / 4;
      boxGroup.add(loopLeft);

      const loopRight = new THREE.Mesh(bowLoopGeo, goldRibbonMat);
      loopRight.position.set(0.15, 0.72, 0);
      loopRight.rotation.z = -Math.PI / 4;
      boxGroup.add(loopRight);

      return boxGroup;
    }

    /**
     * Build a 3D Luxury Ring / Studio Torus
     */
    function createStudioRing(mat) {
      const ringGroup = new THREE.Group();
      const torusGeo = new THREE.TorusGeometry(0.85, 0.16, 20, 48);
      const torus = new THREE.Mesh(torusGeo, mat);
      ringGroup.add(torus);

      const innerSphereGeo = new THREE.SphereGeometry(0.32, 24, 24);
      const innerSphere = new THREE.Mesh(innerSphereGeo, goldRibbonMat);
      ringGroup.add(innerSphere);
      return ringGroup;
    }

    // Populate 3D Showroom Objects around the viewport
    const floatingItems = [];
    const totalObjects = 22;

    for (let i = 0; i < totalObjects; i++) {
      const mat = bagMaterials[i % bagMaterials.length];
      let mesh;
      const type = i % 3;
      if (type === 0) {
        mesh = createShoppingBag(mat);
      } else if (type === 1) {
        mesh = createGiftBox(mat);
      } else {
        mesh = createStudioRing(mat);
      }

      // Distribute mainly around the left/right edges and deep background
      const side = i % 2 === 0 ? -1 : 1;
      const spreadX = (Math.random() * 11 + 4.5) * side;
      const spreadY = (Math.random() - 0.5) * 22;
      const spreadZ = -Math.random() * 14 - 1;

      mesh.position.set(spreadX, spreadY, spreadZ);

      const scale = 0.55 + Math.random() * 0.55;
      mesh.scale.set(scale, scale, scale);

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI * 0.4
      );

      scene.add(mesh);

      floatingItems.push({
        mesh: mesh,
        baseX: spreadX,
        baseY: spreadY,
        baseZ: spreadZ,
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.012,
        floatSpeed: 0.8 + Math.random() * 1.2,
        floatOffset: Math.random() * Math.PI * 2,
        floatAmp: 0.35 + Math.random() * 0.45
      });
    }

    // Mouse & Scroll Tracking for 3D Camera Depth
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let scrollY = window.scrollY || 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2.2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 1.6;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || 0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Camera responds to both mouse parallax and scroll depth
      camera.position.x = currentMouseX * 1.8;
      camera.position.y = currentMouseY * 1.2 - (scrollY * 0.004);
      camera.lookAt(0, -(scrollY * 0.004), 0);

      for (let i = 0; i < floatingItems.length; i++) {
        const item = floatingItems[i];
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.position.y =
          item.baseY + Math.sin(elapsed * item.floatSpeed + item.floatOffset) * item.floatAmp;
      }

      renderer.render(scene, camera);
    }

    animate();
  }

  // Ensure Three.js is available on every page
  if (typeof THREE !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootScene);
    } else {
      bootScene();
    }
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = bootScene;
    document.head.appendChild(script);
  }
})();
