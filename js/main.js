const state = {
  works: [],
  currentCategory: 'all',
  mouse: { x: 0, y: 0 },
  smooth: { x: 0, y: 0 }
};

const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
const lerp = (a, b, n) => (1 - n) * a + n * b;

const CDN = 'https://cdn.jsdelivr.net/gh/SHEN778io/SHEN778io.github.io@latest';

window.addEventListener('mousemove', (e) => {
  state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

function initNav() {
  const nav = $('#nav');
  const links = $$('.nav-link');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const y = window.scrollY + window.innerHeight * 0.3;
    let active = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= y) active = s;
    }
    links.forEach((a) => {
      const target = $(a.getAttribute('href'));
      a.classList.toggle('active', target === active);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initHero() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (isMobile || typeof THREE === 'undefined') {
    const canvas = $('#hero-canvas');
    if (canvas) canvas.style.display = 'none';
    const hero = $('#hero');
    if (hero) hero.classList.add('hero-fallback');
    return;
  }
  try {
  const canvas = $('#hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(6, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff0d0, 0.5);
  fill.position.set(-6, 2, 4);
  scene.add(fill);
  const rim = new THREE.PointLight(0xff7a00, 0.5, 30);
  rim.position.set(-8, -5, 5);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);
  const meshes = [];
  const add = (m, x, y, z, rx, ry, opts) => {
    opts = opts || {};
    m.position.set(x, y, z);
    group.add(m);
    meshes.push({ m, x, y, z, rx, ry, ring: opts.ring || false, slowRot: opts.slowRot || false, bobAmp: opts.bobAmp || 0.04 });
  };

  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.4, 1),
    new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.85, metalness: 0.1, flatShading: true })
  );
  add(rock, -0.5, -0.4, 0, 0.001, 0.003, { bobAmp: 0.06 });

  const aiChip = new THREE.Group();
  const chipBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x1a2a18, roughness: 0.5, metalness: 0.7 })
  );
  aiChip.add(chipBase);
  const aiCoreMat = new THREE.MeshBasicMaterial({ color: 0x7ad84a });
  const aShape = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.02), aiCoreMat);
  aShape.position.set(-0.18, 0, 0.1);
  const iShape = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.02), aiCoreMat);
  iShape.position.set(0.18, 0, 0.1);
  aiChip.add(aShape, iShape);
  const dendMat = new THREE.MeshStandardMaterial({ color: 0x88ff66, emissive: 0x44aa22, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.3 });
  for (let i = 0; i < 12; i++) {
    const side = i % 4;
    const idx = Math.floor(i / 4);
    const offset = -0.5 + idx * 0.5;
    const len = 0.4 + Math.random() * 0.4;
    let pos = [0, 0, 0];
    if (side === 0) pos = [offset, 0.7, 0];
    if (side === 1) pos = [offset, -0.7, 0];
    if (side === 2) pos = [-0.7, offset, 0];
    if (side === 3) pos = [0.7, offset, 0];
    const dend = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 6), dendMat);
    dend.position.set(pos[0], pos[1], 0);
    if (side === 0) dend.position.y += len / 2;
    if (side === 1) dend.position.y -= len / 2;
    if (side === 2) { dend.rotation.z = Math.PI / 2; dend.position.x -= len / 2; }
    if (side === 3) { dend.rotation.z = Math.PI / 2; dend.position.x += len / 2; }
    aiChip.add(dend);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), dendMat);
    if (side === 0) tip.position.set(pos[0], pos[1] + len, 0);
    if (side === 1) tip.position.set(pos[0], pos[1] - len, 0);
    if (side === 2) tip.position.set(pos[0] - len, pos[1], 0);
    if (side === 3) tip.position.set(pos[0] + len, pos[1], 0);
    aiChip.add(tip);
  }
  const aiLabelCanvas = document.createElement('canvas');
  aiLabelCanvas.width = 128; aiLabelCanvas.height = 128;
  const aiCtx = aiLabelCanvas.getContext('2d');
  aiCtx.fillStyle = '#7ad84a';
  aiCtx.font = 'bold 64px Arial';
  aiCtx.textAlign = 'center';
  aiCtx.textBaseline = 'middle';
  aiCtx.fillText('AI', 64, 64);
  const aiTex = new THREE.CanvasTexture(aiLabelCanvas);
  const aiSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: aiTex, transparent: true }));
  aiSprite.scale.set(0.8, 0.8, 1);
  aiSprite.position.set(0, 0, 0.15);
  aiChip.add(aiSprite);
  add(aiChip, -1.4, 1.6, 0.5, 0.005, -0.008, { bobAmp: 0.08 });

  const clapper = new THREE.Group();
  const clapperBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.3 })
  );
  clapper.add(clapperBody);
  const clapperLid = new THREE.Group();
  const lidBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.25, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.3 })
  );
  clapperLid.add(lidBase);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.16), stripeMat);
    stripe.position.set(-0.55 + i * 0.27, 0, 0);
    stripe.rotation.z = -0.6;
    clapperLid.add(stripe);
  }
  clapperLid.position.y = 0.55;
  clapperLid.rotation.z = -0.08;
  clapper.add(clapperLid);
  const vidLabel = document.createElement('canvas');
  vidLabel.width = 256; vidLabel.height = 64;
  const vCtx = vidLabel.getContext('2d');
  vCtx.fillStyle = '#ffae00';
  vCtx.font = 'bold 36px Arial';
  vCtx.textAlign = 'center';
  vCtx.textBaseline = 'middle';
  vCtx.fillText('VIDEO', 128, 32);
  const vidTex = new THREE.CanvasTexture(vidLabel);
  const vidSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: vidTex, transparent: true }));
  vidSprite.scale.set(0.9, 0.225, 1);
  vidSprite.position.set(0, -0.15, 0.07);
  clapper.add(vidSprite);
  clapper.rotation.z = 0.25;
  add(clapper, 2.6, -1.6, 0.4, 0.003, 0.006, { bobAmp: 0.06 });

  const filmstrip = new THREE.Group();
  const filmBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.5, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.3 })
  );
  filmstrip.add(filmBase);
  const holeMat = new THREE.MeshStandardMaterial({ color: 0xffae00, emissive: 0xff6600, emissiveIntensity: 0.3 });
  for (let i = 0; i < 6; i++) {
    [-0.18, 0.18].forEach((y) => {
      const hole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.05), holeMat);
      hole.position.set(-1.0 + i * 0.4, y, 0.025);
      filmstrip.add(hole);
    });
    const frameColors = [0xff5577, 0x4488ff, 0x33ddaa, 0xffd633, 0xcc66ff, 0x66ddff];
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.04),
      new THREE.MeshStandardMaterial({ color: frameColors[i], roughness: 0.4, metalness: 0.2, emissive: frameColors[i], emissiveIntensity: 0.2 })
    );
    frame.position.set(-1.0 + i * 0.4, 0, 0.025);
    filmstrip.add(frame);
  }
  filmstrip.rotation.z = -0.15;
  add(filmstrip, 0.5, -2.0, 0.3, 0, 0.008, { bobAmp: 0.05 });

  const playBtn = new THREE.Group();
  const playCircle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0xff3030, roughness: 0.3, metalness: 0.5, emissive: 0xff1010, emissiveIntensity: 0.4 })
  );
  playCircle.rotation.x = Math.PI / 2;
  playBtn.add(playCircle);
  const triShape = new THREE.Shape();
  triShape.moveTo(-0.14, 0.20);
  triShape.lineTo(0.20, 0.00);
  triShape.lineTo(-0.14, -0.20);
  triShape.lineTo(-0.14, 0.20);
  const triGeo = new THREE.ShapeGeometry(triShape);
  const tri = new THREE.Mesh(triGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  tri.position.z = 0.08;
  playBtn.add(tri);
  add(playBtn, -1.8, -0.5, 0.8, 0, 0.015, { bobAmp: 0.07 });

  const brainNet = new THREE.Group();
  const layers = [[-0.8, -0.4, 0], [0, 0, 0.3], [0.8, 0.4, 0]];
  const netNodes = [];
  layers.forEach(([lx, ly, lz], layerIdx) => {
    for (let n = 0; n < 4; n++) {
      const y = -0.6 + n * 0.4 + ly;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({
          color: layerIdx === 1 ? 0xff5577 : (layerIdx === 0 ? 0x66ddff : 0xffd633),
          emissive: layerIdx === 1 ? 0xff5577 : (layerIdx === 0 ? 0x66ddff : 0xffd633),
          emissiveIntensity: 0.6,
          roughness: 0.3,
          metalness: 0.5
        })
      );
      node.position.set(lx, y, lz);
      brainNet.add(node);
      netNodes.push({ pos: node.position.clone(), layer: layerIdx });
    }
  });
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        const a = netNodes[i];
        const b = netNodes[4 + j];
        const c = netNodes[8 + k];
        const lineA = new THREE.BufferGeometry().setFromPoints([a.pos, b.pos]);
        brainNet.add(new THREE.Line(lineA, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })));
        const lineB = new THREE.BufferGeometry().setFromPoints([b.pos, c.pos]);
        brainNet.add(new THREE.Line(lineB, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })));
      }
    }
  }
  add(brainNet, 2.8, -0.5, 0.5, 0.005, 0.01, { bobAmp: 0.06 });

  const cameraBody = new THREE.Group();
  const camBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.35, metalness: 0.85 })
  );
  cameraBody.add(camBody);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.15, metalness: 1.0 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.1, metalness: 0.7, emissive: 0x1a3a8a, emissiveIntensity: 0.4 });
  const lensPositions = [[0.55, 0.55, 0.45], [-0.55, 0.55, 0.45], [0.55, -0.55, 0.45], [-0.55, -0.55, 0.45]];
  lensPositions.forEach(([x, y, z]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 24), lensMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, z);
    cameraBody.add(ring);
    const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.21, 24), irisMat);
    iris.rotation.x = Math.PI / 2;
    iris.position.set(x, y, z + 0.02);
    cameraBody.add(iris);
  });
  add(cameraBody, 2.0, 1.6, 0.6, 0.004, 0.006, { bobAmp: 0.07 });

  const pumpkin = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x8a4cff, roughness: 0.55, metalness: 0.2 })
  );
  pumpkin.scale.set(1, 0.85, 1);
  add(pumpkin, 2.4, 0.0, 0.3, 0.002, 0.004, { bobAmp: 0.05 });

  const orangeTorus = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.28, 20, 60, Math.PI * 1.4),
    new THREE.MeshStandardMaterial({ color: 0xff7a2a, roughness: 0.4, metalness: 0.4 })
  );
  orangeTorus.rotation.z = -Math.PI / 2.3;
  add(orangeTorus, -2.6, 0.6, 0.4, 0.003, 0.005, { bobAmp: 0.08 });

  const mic = new THREE.Group();
  const micBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.4, 32),
    new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.3, metalness: 0.85 })
  );
  mic.add(micBody);
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6, metalness: 0.5 });
  for (let i = 0; i < 10; i++) {
    const groove = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.02, 8, 32), grooveMat);
    groove.rotation.x = Math.PI / 2;
    groove.position.y = -0.65 + i * 0.14;
    mic.add(groove);
  }
  mic.rotation.z = 0.3;
  add(mic, -2.4, -1.5, 0.3, 0, 0.01, { bobAmp: 0.05 });

  const mintRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.18, 16, 40, Math.PI * 1.2),
    new THREE.MeshStandardMaterial({ color: 0xc5d8c4, roughness: 0.5, metalness: 0.3 })
  );
  mintRing.rotation.z = Math.PI / 2;
  add(mintRing, 0.8, 0.8, 1.0, 0.005, 0.003, { bobAmp: 0.06 });

  const screenBall = new THREE.Group();
  const sbBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 })
  );
  screenBall.add(sbBody);
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const cellMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL((i + j + 4) / 8, 0.7, 0.5) });
      const cell = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.13), cellMat);
      cell.position.set(i * 0.15, j * 0.15, 0.55);
      cell.lookAt(0, 0, 5);
      screenBall.add(cell);
    }
  }
  add(screenBall, 0.4, 0.0, 0.8, 0.01, 0.012, { bobAmp: 0.06 });

  const nodeGroup = new THREE.Group();
  const nodeColors = [0xff5577, 0x4488ff, 0x33ddaa, 0xffd633, 0xcc66ff, 0x66ddff];
  const nodePositions = [];
  for (let i = 0; i < 8; i++) {
    const r = 1.4 + Math.random() * 0.5;
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    nodePositions.push(new THREE.Vector3(x, y, 0.2 + Math.random() * 0.3));
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({ color: nodeColors[i % nodeColors.length], roughness: 0.4, metalness: 0.4 })
    );
    ball.position.copy(nodePositions[i]);
    nodeGroup.add(ball);
  }
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      if (Math.random() < 0.5) {
        const geo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
        nodeGroup.add(line);
      }
    }
  }
  nodeGroup.position.set(1.0, 0.0, 0.6);
  group.add(nodeGroup);
  meshes.push({ m: nodeGroup, x: 1.0, y: 0, z: 0.6, rx: 0, ry: 0.005, ring: false, slowRot: true, bobAmp: 0.04 });

  const pinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.4 });
  const pinPositions = [[-4.0, 2.0, 0.0], [3.5, -2.0, 0.0], [-3.0, -2.4, 0.0], [4.0, 2.2, 0.0]];
  pinPositions.forEach(([x, y, z]) => {
    const pin = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), pinMat);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 12), pinMat);
    tail.position.y = -0.18;
    pin.add(head, tail);
    pin.position.set(x, y, z);
    group.add(pin);
    meshes.push({ m: pin, x, y, z, rx: 0, ry: 0, ring: false, bobAmp: 0.07 });
  });

  for (let i = 0; i < 2; i++) {
    const r = i ? 5.0 : 4.0;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.015, 8, 200),
      new THREE.MeshBasicMaterial({ color: i ? 0xffffff : 0xfacc15, transparent: true, opacity: i ? 0.25 : 0.4 })
    );
    ring.rotation.x = Math.PI / 2 - 0.5;
    ring.rotation.z = i ? 0.3 : -0.3;
    scene.add(ring);
    meshes.push({ m: ring, x: 0, y: 0, z: 0, rx: 0, ry: 0.0008 * (i + 1), ring: true, bobAmp: 0 });
  }

  const particleGeo = new THREE.BufferGeometry();
  const N = 220;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    const c = new THREE.Color().setHSL(Math.random(), 0.7, 0.6);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.85 })
  );
  scene.add(particles);

  let bounce = 0;
  canvas.addEventListener('click', () => { bounce = 1; });
  window.addEventListener('hero-bounce', () => { bounce = 1; });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    state.smooth.x = lerp(state.smooth.x, state.mouse.x, 0.05);
    state.smooth.y = lerp(state.smooth.y, state.mouse.y, 0.05);
    group.rotation.y = state.smooth.x * 0.18 + bounce * 0.05;
    group.rotation.x = -state.smooth.y * 0.1 - bounce * 0.03;
    if (bounce > 0) bounce -= 0.04;
    meshes.forEach((it) => {
      it.m.rotation.x += it.rx;
      it.m.rotation.y += it.ry;
      if (it.ring) it.m.rotation.z += it.ry;
      const b = it.bobAmp || 0.04;
      it.m.position.y = it.y + Math.sin(t * 0.6 + it.x * 1.3) * b;
      it.m.position.x = it.x + Math.cos(t * 0.4 + it.y) * b * 0.3;
    });
    particles.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  } catch (e) {
    console.warn('Hero 3D fallback:', e);
    const c = $('#hero-canvas');
    if (c) c.style.display = 'none';
    const hero = $('#hero');
    if (hero) hero.classList.add('hero-fallback');
  }
}

function initDog() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  if (typeof THREE === 'undefined') {
    const wrap = $('#dog-wrap');
    if (wrap) wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px">🐶</div>';
    return;
  }
  if (isMobile) {
    const wrap = $('#dog-wrap');
    if (wrap) wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px;animation:float 6s ease-in-out infinite">🐶</div>';
    return;
  }
  try {
  const canvas = $('#dog-canvas');
  const wrap = $('#dog-wrap');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 50);
  camera.position.set(0, 0.4, 7);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 3, 4);
  scene.add(key);
  const yellow = new THREE.PointLight(0xfa0, 1.2, 12);
  yellow.position.set(-2, 1, 3);
  scene.add(yellow);

  const dog = new THREE.Group();
  scene.add(dog);

  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfa0, roughness: 0.45, metalness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.4 });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.95 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.6 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xff6b8b, roughness: 0.5, metalness: 0.1 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), yellowMat);
  body.position.y = -0.4;
  body.scale.set(1, 0.85, 0.95);
  dog.add(body);

  const head = new THREE.Group();
  head.position.y = 0.9;
  dog.add(head);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), yellowMat);
  head.add(headMesh);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), yellowMat);
  snout.position.set(0, -0.15, 0.7);
  snout.scale.set(1, 0.7, 1.1);
  head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), darkMat);
  nose.position.set(0, 0.0, 1.05);
  head.add(nose);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), eyeMat);
  eyeL.position.set(-0.28, 0.25, 0.78);
  head.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), eyeMat);
  eyeR.position.set(0.28, 0.25, 0.78);
  head.add(eyeR);
  const hlL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), whiteMat);
  hlL.position.set(-0.25, 0.28, 0.86);
  head.add(hlL);
  const hlR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), whiteMat);
  hlR.position.set(0.31, 0.28, 0.86);
  head.add(hlR);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), darkMat);
  earL.position.set(-0.65, 0.6, 0.1);
  earL.scale.set(0.5, 0.9, 0.3);
  head.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.65;
  head.add(earR);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.4), pinkMat);
  tongue.position.set(0, -0.25, 1.0);
  tongue.visible = false;
  head.add(tongue);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 12, 32), collarMat);
  collar.position.y = 0.45;
  collar.rotation.x = Math.PI / 2;
  dog.add(collar);
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.04), collarMat);
  tag.position.set(0, 0.25, 0.55);
  dog.add(tag);

  const legGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.7, 16);
  [[-0.55, -1.15, 0.35], [0.55, -1.15, 0.35], [-0.55, -1.15, -0.35], [0.55, -1.15, -0.35]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, darkMat);
    leg.position.set(x, y, z);
    dog.add(leg);
  });

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, -0.2, -0.9);
  dog.add(tailGroup);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.8, 12), yellowMat);
  tail.position.y = 0.3;
  tail.rotation.x = -0.6;
  tailGroup.add(tail);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), yellowMat);
  tailTip.position.set(0, 0.7, 0);
  tailGroup.add(tailTip);

  const look = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  const state2 = { wag: 0, breath: 0, bounce: 0, blink: 0 };
  let isExcited = false;
  let excitedUntil = 0;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    look.x = x * 0.5;
    look.y = y * 0.3;
  });
  canvas.addEventListener('mouseleave', () => { look.x = 0; look.y = 0; });
  canvas.addEventListener('click', () => {
    isExcited = true;
    excitedUntil = performance.now() + 2000;
    tongue.visible = true;
    setTimeout(() => {
      const bubble = $('#dog-bubble');
      if (bubble) {
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 1200);
      }
    }, 400);
  });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    const now = performance.now();
    const excited = now < excitedUntil;
    const bounceAmp = excited ? Math.max(0, 1 - (excitedUntil - now) / 2000) : 0;

    smooth.x = lerp(smooth.x, look.x, 0.08);
    smooth.y = lerp(smooth.y, look.y, 0.08);
    head.rotation.y = smooth.x;
    head.rotation.x = smooth.y * 0.5;

    state2.breath = (Math.sin(t * 1.5) + 1) / 2;
    body.scale.y = 0.85 + state2.breath * 0.04;

    if (Math.random() < 0.005) state2.blink = 1;
    if (state2.blink > 0) {
      const s = Math.max(0, 1 - state2.blink * 8);
      eyeL.scale.y = s;
      eyeR.scale.y = s;
      state2.blink -= 0.05;
      if (state2.blink <= 0) { eyeL.scale.y = 1; eyeR.scale.y = 1; }
    }

    const wagSpeed = excited ? 18 : 4;
    const wagAmp = excited ? 0.6 : 0.2;
    tailGroup.rotation.y = Math.sin(t * wagSpeed) * wagAmp;

    if (excited) {
      dog.position.y = Math.abs(Math.sin(t * 8)) * 0.25 * bounceAmp;
      dog.rotation.z = Math.sin(t * 10) * 0.08 * bounceAmp;
      tongue.visible = true;
      tongue.scale.x = 1 + Math.sin(t * 20) * 0.2;
    } else {
      dog.position.y = lerp(dog.position.y, 0, 0.1);
      dog.rotation.z = lerp(dog.rotation.z, 0, 0.1);
      tongue.visible = false;
    }
    dog.position.y += Math.sin(t * 1.2) * 0.05;

    renderer.render(scene, camera);
  }
  tick();

  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  });
  ro.observe(canvas);
  } catch (e) {
    console.warn('Dog 3D fallback:', e);
    const w = $('#dog-wrap');
    if (w) w.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px">🐶</div>';
  }
}

async function loadWorks() {
  const res = await fetch('data/works.json');
  state.works = await res.json();
  renderAllCategories();
}

function renderAllCategories() {
  const groups = {
    '品牌宣传': state.works.filter((w) => w.category === '品牌宣传'),
    '产品展示': state.works.filter((w) => w.category === '产品展示'),
    '口播带货': state.works.filter((w) => w.category === '口播带货'),
    '其他': state.works.filter((w) => w.category === '其他')
  };

  Object.entries(groups).forEach(([cat, list]) => {
    const root = document.querySelector('#works-' + slug(cat) + ' .works-grid');
    if (!root || !list.length) return;
    root.innerHTML = list.map((w, i) => workCardHTML(w, i === 0)).join('');
  });

  document.querySelectorAll('.work-card').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const w = state.works.find((x) => x.id === id);
      if (w) openPlayer(w);
    });
  });
}

function workCardHTML(w, isFeatured) {
  if (isFeatured) {
    return '<article class="work-card work-featured" data-id="' + w.id + '">'
      + '<div class="thumb" style="background-image:url(\'' + w.posterDetail + '\')">'
      + '<div class="play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>'
      + '<div class="featured-overlay"><h3>' + (w.subtitle || w.title) + '</h3><p>' + (w.description || '') + '</p></div>'
      + '<div class="work-info"><h4>' + w.title + '</h4><p>' + (w.description || '') + '</p>'
      + '<div class="tags">' + (w.tags || []).map(function(t) { return '<span>' + t + '</span>'; }).join('') + '</div></div></article>';
  }
  return '<article class="work-card" data-id="' + w.id + '">'
    + '<div class="thumb" style="background-image:url(\'' + w.poster + '\')">'
    + '<div class="play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>'
    + '<span class="duration">' + w.duration + '</span></div>'
    + '<div class="work-info">' + (w.brand ? '<span class="brand">' + w.brand + '</span>' : '')
    + '<h4>' + w.title + '</h4><p>' + (w.subtitle || w.description || '') + '</p>'
    + '<div class="tags">' + (w.tags || []).map(function(t) { return '<span>' + t + '</span>'; }).join('') + '</div></div></article>';
}

function slug(s) {
  var map = { '品牌宣传': 'brand', '产品展示': 'product', '口播带货': 'livestream', '其他': 'other' };
  return map[s] || s;
}

function openPlayer(w) {
  var modal = $('#player-modal');
  $('#player-title').textContent = w.title;
  $('#player-meta').textContent = w.category + ' · ' + w.duration + ' · ' + w.resolution;
  $('#player-desc').textContent = w.description || '';
  var video = $('#player-video');
  video.poster = w.posterDetail || w.poster;
  video.src = CDN + '/' + w.video;
  modal.classList.add('show');
  video.play()['catch'](function() {});
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  var modal = $('#player-modal');
  var video = $('#player-video');
  modal.classList.remove('show');
  video.pause();
  video.removeAttribute('src');
  video.load();
  document.body.style.overflow = '';
}

function initPlayer() {
  $('#player-close').addEventListener('click', closePlayer);
  $('#player-modal').addEventListener('click', function(e) {
    if (e.target.id === 'player-modal') closePlayer();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePlayer();
  });
}

function initReveal() {
  var items = $$('.reveal');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(function(el) { io.observe(el); });
}

function initTextFX() {
  var targets = $$('[data-text-split] [data-text]');
  if (!targets.length) return;

  targets.forEach(function(el) {
    var text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    el.textContent = '';
    var chars = text.split('');
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      var span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.setProperty('--i', i);
      el.appendChild(span);
    }
    el.classList.add('fx-inited');
  });

  var hero = $('#hero');
  if (!hero) return;
  hero.addEventListener('mousemove', function(e) {
    var rect = hero.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    $$('.hero-title .filled, .hero-title .stroke').forEach(function(el) {
      el.style.transform = 'translate(' + (x * 18) + 'px, ' + (y * 10) + 'px)';
    });
  });
  hero.addEventListener('mouseleave', function() {
    $$('.hero-title .filled, .hero-title .stroke').forEach(function(el) {
      el.style.transform = '';
    });
  });

  var titleChars = $$('.hero-title .ch');
  titleChars.forEach(function(ch) {
    ch.addEventListener('mouseenter', function() {
      ch.classList.add('wave');
      setTimeout(function() { ch.classList.remove('wave'); }, 700);
    });
  });

  var subChars = $$('.hero-sub .ch');
  if (subChars.length) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('rise');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    subChars.forEach(function(c) { io.observe(c); });
  }

  $$('.hero-actions .btn').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = 'translateY(-2px) perspective(600px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg)';
      btn.style.setProperty('--mx', ((x + 0.5) * 100) + '%');
      btn.style.setProperty('--my', ((y + 0.5) * 100) + '%');
    });
    btn.addEventListener('mouseleave', function() { btn.style.transform = ''; });
    btn.addEventListener('click', function() {
      btn.classList.add('pulse');
      setTimeout(function() { btn.classList.remove('pulse'); }, 500);
      window.dispatchEvent(new CustomEvent('hero-bounce'));
    });
  });
}

window.addEventListener('DOMContentLoaded', function() {
  var safe = function(fn, name) {
    try { fn(); } catch(e) { console.warn(name + ' failed:', e); }
  };
  safe(initNav, 'initNav');
  safe(initTextFX, 'initTextFX');
  safe(initHero, 'initHero');
  safe(initDog, 'initDog');
  safe(initPlayer, 'initPlayer');
  safe(initReveal, 'initReveal');
  safe(loadWorks, 'loadWorks');
});
