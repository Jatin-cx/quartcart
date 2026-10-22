/**
 * bg-3d.js - Full-Viewport Interactive 3D Cyber Retail Showroom Background
 * Renders floating 3D shopping bags, wrapped gift boxes, neon rose studio rings,
 * and drifting cyber star particles in Jet Black, Cerulean Blue, and Neon Rose.
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
      'opacity: 0.94'
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
    scene.fog = new THREE.FogExp2(0x07080b, 0.035);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    // Cyber Cerulean & Neon Rose Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x0a101f, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0ea5e9, 1.8);
    keyLight.position.set(10, 16, 12);
    scene.add(keyLight);

    const ceruleanPoint = new THREE.PointLight(0x0ea5e9, 3.4, 55);
    ceruleanPoint.position.set(-13, 8, 9);
    scene.add(ceruleanPoint);

    const neonRosePoint = new THREE.PointLight(0xff2a85, 3.8, 55);
    neonRosePoint.position.set(13, -8, 10);
    scene.add(neonRosePoint);

    const cyanGlow = new THREE.PointLight(0x38bdf8, 2.2, 45);
    cyanGlow.position.set(0, 12, -8);
    scene.add(cyanGlow);

    const deepRoseFill = new THREE.PointLight(0xf43f5e, 2.4, 45);
    deepRoseFill.position.set(0, -10, 6);
    scene.add(deepRoseFill);

    // Shared Cyber Retail Materials
    const bagMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0x090c12,
        roughness: 0.22,
        metalness: 0.88,
        emissive: 0x05080f,
        emissiveIntensity: 0.2
      }), // Obsidian Jet Black Gloss
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.24,
        metalness: 0.65,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25
      }), // Electric Cerulean
      new THREE.MeshStandardMaterial({
        color: 0xff2a85,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0x88003a,
        emissiveIntensity: 0.35
      }), // Neon Rose Glow
      new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.28,
        metalness: 0.7,
        emissive: 0x02456b,
        emissiveIntensity: 0.2
      }), // Deep Cerulean Obsidian
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.15,
        metalness: 0.95,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.15
      })  // Cyber Ice Chrome
    ];

    const neonRoseTrimMat = new THREE.MeshStandardMaterial({
      color: 0xff2a85,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0xff2a85,
      emissiveIntensity: 0.45
    });

    const ceruleanTrimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.18,
      metalness: 0.88,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35
    });

    /**
     * Build a 3D Shopping Bag mesh group
     */
    function createShoppingBag(mat, isRoseAccent) {
      const bagGroup = new THREE.Group();
      const trimMat = isRoseAccent ? neonRoseTrimMat : ceruleanTrimMat;

      // Main bag body
      const bodyGeo = new THREE.BoxGeometry(1.3, 1.55, 0.58);
      const bodyMesh = new THREE.Mesh(bodyGeo, mat);
      bagGroup.add(bodyMesh);

      // Top cuff fold accent
      const cuffGeo = new THREE.BoxGeometry(1.34, 0.18, 0.62);
      const cuffMesh = new THREE.Mesh(cuffGeo, trimMat);
      cuffMesh.position.y = 0.7;
      bagGroup.add(cuffMesh);

      // Front emblem tag
      const tagGeo = new THREE.BoxGeometry(0.45, 0.25, 0.04);
      const tagMesh = new THREE.Mesh(tagGeo, isRoseAccent ? ceruleanTrimMat : neonRoseTrimMat);
      tagMesh.position.set(0, 0.1, 0.3);
      bagGroup.add(tagMesh);

      // Arched Handles (Front & Back)
      const handleGeo = new THREE.TorusGeometry(0.32, 0.045, 12, 28, Math.PI);
      const handleFront = new THREE.Mesh(handleGeo, trimMat);
      handleFront.position.set(0, 0.78, 0.18);
      bagGroup.add(handleFront);

      const handleBack = new THREE.Mesh(handleGeo, trimMat);
      handleBack.position.set(0, 0.78, -0.18);
      bagGroup.add(handleBack);

      return bagGroup;
    }

    /**
     * Build a 3D Wrapped Gift Box mesh group
     */
    function createGiftBox(mat, isRoseAccent) {
      const boxGroup = new THREE.Group();
      const trimMat = isRoseAccent ? neonRoseTrimMat : ceruleanTrimMat;

      const baseGeo = new THREE.BoxGeometry(1.2, 1.05, 1.2);
      const baseMesh = new THREE.Mesh(baseGeo, mat);
      boxGroup.add(baseMesh);

      const lidGeo = new THREE.BoxGeometry(1.28, 0.24, 1.28);
      const lidMesh = new THREE.Mesh(lidGeo, mat);
      lidMesh.position.y = 0.48;
      boxGroup.add(lidMesh);

      // Cross Ribbons
      const rib1Geo = new THREE.BoxGeometry(1.3, 1.12, 0.18);
      const rib1 = new THREE.Mesh(rib1Geo, trimMat);
      rib1.position.y = 0.04;
      boxGroup.add(rib1);

      const rib2Geo = new THREE.BoxGeometry(0.18, 1.12, 1.3);
      const rib2 = new THREE.Mesh(rib2Geo, trimMat);
      rib2.position.y = 0.04;
      boxGroup.add(rib2);

      // Top Bow Loops
      const bowLoopGeo = new THREE.TorusGeometry(0.18, 0.04, 10, 20);
      const loopLeft = new THREE.Mesh(bowLoopGeo, trimMat);
      loopLeft.position.set(-0.15, 0.72, 0);
      loopLeft.rotation.z = Math.PI / 4;
      boxGroup.add(loopLeft);

      const loopRight = new THREE.Mesh(bowLoopGeo, trimMat);
      loopRight.position.set(0.15, 0.72, 0);
      loopRight.rotation.z = -Math.PI / 4;
      boxGroup.add(loopRight);

      return boxGroup;
    }

    /**
     * Build a 3D Cyber Studio Torus Ring
     */
    function createStudioRing(mat, isRoseAccent) {
      const ringGroup = new THREE.Group();
      const trimMat = isRoseAccent ? neonRoseTrimMat : ceruleanTrimMat;

      const torusGeo = new THREE.TorusGeometry(0.85, 0.16, 20, 48);
      const torus = new THREE.Mesh(torusGeo, mat);
      ringGroup.add(torus);

      const innerSphereGeo = new THREE.SphereGeometry(0.32, 24, 24);
      const innerSphere = new THREE.Mesh(innerSphereGeo, trimMat);
      ringGroup.add(innerSphere);
      return ringGroup;
    }

    // Populate 3D Cyber Objects around the viewport
    const floatingItems = [];
    const totalObjects = 24;

    for (let i = 0; i < totalObjects; i++) {
      const mat = bagMaterials[i % bagMaterials.length];
      const isRose = i % 2 === 0;
      let mesh;
      const type = i % 3;
      if (type === 0) {
        mesh = createShoppingBag(mat, isRose);
      } else if (type === 1) {
        mesh = createGiftBox(mat, !isRose);
      } else {
        mesh = createStudioRing(mat, isRose);
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

    // ─── Floating Cyber Star & Ember Particles ──────────────────
    const starCount = 260;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const ceruleanCol = new THREE.Color(0x0ea5e9);
    const neonRoseCol = new THREE.Color(0xff2a85);
    const cyanCol = new THREE.Color(0x38bdf8);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 36;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 32;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 24;

      const pick = Math.random();
      const col = pick < 0.45 ? ceruleanCol : pick < 0.8 ? neonRoseCol : cyanCol;
      starColors[i3] = col.r;
      starColors[i3 + 1] = col.g;
      starColors[i3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

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

      // Camera responds to mouse parallax and scroll depth
      camera.position.x = currentMouseX * 1.8;
      camera.position.y = currentMouseY * 1.2 - (scrollY * 0.004);
      camera.lookAt(0, -(scrollY * 0.004), 0);

      // Rotate star particles slowly in 3D
      starField.rotation.y = elapsed * 0.02;
      starField.rotation.x = elapsed * 0.01;

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
