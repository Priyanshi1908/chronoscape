import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate as animeAnimate, stagger as animeStagger } from 'animejs';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// SEASON CONFIGURATION
// ============================================
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const SEASON_CONFIG = {
  spring: {
    index: 0,
    name: 'SPRING',
    phase: 'AWAKENING',
    bgColor: new THREE.Color(0xf5f0e8),
    particleColor1: new THREE.Color(0x4a7c59),
    particleColor2: new THREE.Color(0xc85a7c),
    particleColor3: new THREE.Color(0x88b892),
    coreColor: new THREE.Color(0x5a9c6a),
    glowColor: new THREE.Color(0x4a7c59),
    morphSpeed: 0.8,
    morphAmplitude: 0.4,
    particleSpread: 2.5,
    particleDrift: new THREE.Vector3(0.0, 0.003, 0.0),
    noiseScale: 1.2,
    geometryDetail: 64,
    rotationSpeed: 0.002,
    coreScale: 1.0,
  },
  summer: {
    index: 1,
    name: 'SUMMER',
    phase: 'ZENITH',
    bgColor: new THREE.Color(0xfefaf2),
    particleColor1: new THREE.Color(0xe8a025),
    particleColor2: new THREE.Color(0xd4542a),
    particleColor3: new THREE.Color(0xf0c860),
    coreColor: new THREE.Color(0xe8a025),
    glowColor: new THREE.Color(0xe8a025),
    morphSpeed: 1.2,
    morphAmplitude: 0.6,
    particleSpread: 3.5,
    particleDrift: new THREE.Vector3(0.002, 0.005, 0.001),
    noiseScale: 0.8,
    geometryDetail: 64,
    rotationSpeed: 0.003,
    coreScale: 1.2,
  },
  autumn: {
    index: 2,
    name: 'AUTUMN',
    phase: 'DESCENT',
    bgColor: new THREE.Color(0x1c1714),
    particleColor1: new THREE.Color(0xc4622a),
    particleColor2: new THREE.Color(0x8b3a4a),
    particleColor3: new THREE.Color(0xd4894a),
    coreColor: new THREE.Color(0xc4622a),
    glowColor: new THREE.Color(0xc4622a),
    morphSpeed: 0.5,
    morphAmplitude: 0.35,
    particleSpread: 2.0,
    particleDrift: new THREE.Vector3(0.001, -0.004, 0.001),
    noiseScale: 1.6,
    geometryDetail: 64,
    rotationSpeed: 0.0015,
    coreScale: 0.9,
  },
  winter: {
    index: 3,
    name: 'WINTER',
    phase: 'STILLNESS',
    bgColor: new THREE.Color(0x0a0e14),
    particleColor1: new THREE.Color(0x5a8fb4),
    particleColor2: new THREE.Color(0xa0c4e8),
    particleColor3: new THREE.Color(0x3a6080),
    coreColor: new THREE.Color(0x5a8fb4),
    glowColor: new THREE.Color(0x5a8fb4),
    morphSpeed: 0.3,
    morphAmplitude: 0.2,
    particleSpread: 1.8,
    particleDrift: new THREE.Vector3(0.0, -0.001, 0.0),
    noiseScale: 2.0,
    geometryDetail: 64,
    rotationSpeed: 0.001,
    coreScale: 0.85,
  }
};

// ============================================
// ORACLE DATA
// ============================================
const ORACLE_VERSES = {
  spring: 'What you plant now in silence will riot in color.',
  summer: 'Radiance is not a choice — it is what you become.',
  autumn: 'The tree does not mourn its leaves. It is making room.',
  winter: 'Roots reach deep when the world grows still.',
};

const SEASON_INTENSITY = {
  spring: 0.25,
  summer: 1.0,
  autumn: 0.62,
  winter: 0.14,
};

const SEASON_BARS = {
  spring:  { a: 0.35, b: 0.45, c: 0.78 },
  summer:  { a: 0.95, b: 0.98, c: 0.55 },
  autumn:  { a: 0.62, b: 0.50, c: 0.22 },
  winter:  { a: 0.12, b: 0.18, c: 0.06 },
};

const SEASON_QUOTES = {
  spring: "Nature doesn\u2019t rush, yet everything is accomplished.",
  summer: "At the zenith, light bends around every living thing.",
  autumn: "There is extraordinary beauty in the act of releasing.",
  winter: "Beneath the silence, roots grow deeper.",
};

const SEASON_NUMS = { spring: '01', summer: '02', autumn: '03', winter: '04' };

// ============================================
// STATE
// ============================================
let currentSeasonIndex = 0;
let isTransitioning = false;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let clock = new THREE.Clock();

// ============================================
// SIMPLEX NOISE (inlined for no deps)
// ============================================
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  function dot3(g, x, y, z) { return g[0]*x + g[1]*y + g[2]*z; }

  return function noise3D(x, y, z) {
    const F3 = 1/3, G3 = 1/6;
    const s = (x+y+z)*F3;
    const i = Math.floor(x+s), j = Math.floor(y+s), k = Math.floor(z+s);
    const t = (i+j+k)*G3;
    const X0 = i-t, Y0 = j-t, Z0 = k-t;
    const x0 = x-X0, y0 = y-Y0, z0 = z-Z0;

    let i1,j1,k1,i2,j2,k2;
    if(x0>=y0){
      if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;}
      else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;}
      else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;}
    } else {
      if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;}
      else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;}
      else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;}
    }

    const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
    const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
    const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;

    const ii=i&255, jj=j&255, kk=k&255;
    let n0=0, n1=0, n2=0, n3=0;

    let t0 = 0.6-x0*x0-y0*y0-z0*z0;
    if(t0>0){t0*=t0; n0=t0*t0*dot3(grad3[perm[ii+perm[jj+perm[kk]]]%12],x0,y0,z0);}
    let t1 = 0.6-x1*x1-y1*y1-z1*z1;
    if(t1>0){t1*=t1; n1=t1*t1*dot3(grad3[perm[ii+i1+perm[jj+j1+perm[kk+k1]]]%12],x1,y1,z1);}
    let t2 = 0.6-x2*x2-y2*y2-z2*z2;
    if(t2>0){t2*=t2; n2=t2*t2*dot3(grad3[perm[ii+i2+perm[jj+j2+perm[kk+k2]]]%12],x2,y2,z2);}
    let t3 = 0.6-x3*x3-y3*y3-z3*z3;
    if(t3>0){t3*=t3; n3=t3*t3*dot3(grad3[perm[ii+1+perm[jj+1+perm[kk+1]]]%12],x3,y3,z3);}

    return 32*(n0+n1+n2+n3);
  };
}

const noise3D = createNoise();

// ============================================
// THREE.JS SETUP
// ============================================
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.8, 0.2, 5.5);

// ============================================
// LIGHTING
// ============================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(3, 5, 4);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x4a7c59, 2, 10);
pointLight1.position.set(-3, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xc85a7c, 1.5, 10);
pointLight2.position.set(3, -2, 3);
scene.add(pointLight2);

const rimLight = new THREE.PointLight(0xffffff, 0.8, 10);
rimLight.position.set(0, 0, -4);
scene.add(rimLight);

// ============================================
// CORE ORGANIC FORM
// ============================================
const coreGeometry = new THREE.IcosahedronGeometry(1.3, 40);
const originalPositions = coreGeometry.attributes.position.array.slice();

const coreMaterial = new THREE.MeshPhysicalMaterial({
  color: SEASON_CONFIG.spring.coreColor,
  metalness: 0.1,
  roughness: 0.5,
  transmission: 0.15,
  thickness: 0.8,
  clearcoat: 0.4,
  clearcoatRoughness: 0.2,
  envMapIntensity: 0.6,
  transparent: true,
  opacity: 0.92,
});

const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(coreMesh);

// Inner glow sphere
const glowGeometry = new THREE.IcosahedronGeometry(0.9, 20);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: SEASON_CONFIG.spring.glowColor,
  transparent: true,
  opacity: 0.08,
});
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowMesh);

// ============================================
// PARTICLE SYSTEM - ORBITING PARTICLES
// ============================================
const PARTICLE_COUNT = 3000;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleSizes = new Float32Array(PARTICLE_COUNT);
const particleColors = new Float32Array(PARTICLE_COUNT * 3);
const particleSeeds = new Float32Array(PARTICLE_COUNT * 4);

const initConfig = SEASON_CONFIG.spring;
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = initConfig.particleSpread * (0.6 + Math.random() * 0.8);

  particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  particlePositions[i * 3 + 2] = r * Math.cos(phi);

  particleSizes[i] = Math.random() * 3 + 0.5;

  const colorChoice = Math.random();
  const col = colorChoice < 0.4 ? initConfig.particleColor1 :
              colorChoice < 0.7 ? initConfig.particleColor2 : initConfig.particleColor3;
  particleColors[i * 3] = col.r;
  particleColors[i * 3 + 1] = col.g;
  particleColors[i * 3 + 2] = col.b;

  particleSeeds[i * 4] = (Math.random() - 0.5) * 0.01;
  particleSeeds[i * 4 + 1] = r;
  particleSeeds[i * 4 + 2] = Math.random() * Math.PI * 2;
  particleSeeds[i * 4 + 3] = Math.random() * Math.PI * 2;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  },
  vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;
    uniform float uPixelRatio;

    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = length(mvPosition.xyz);
      vAlpha = smoothstep(8.0, 1.0, dist) * 0.8;
      gl_PointSize = size * uPixelRatio * (4.0 / -mvPosition.z);
      gl_PointSize = max(gl_PointSize, 0.5);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// ============================================
// CONNECTING LINES (Wire tendrils from core)
// ============================================
const LINE_COUNT = 12;
const lineGroup = new THREE.Group();
scene.add(lineGroup);

function createTendril() {
  const points = [];
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const dir = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  );

  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const r = 1.3 + t * 1.8;
    points.push(new THREE.Vector3(
      dir.x * r + (Math.random() - 0.5) * 0.2 * t,
      dir.y * r + (Math.random() - 0.5) * 0.2 * t,
      dir.z * r + (Math.random() - 0.5) * 0.2 * t,
    ));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 20, 0.005, 4, false);
  const material = new THREE.MeshBasicMaterial({
    color: initConfig.particleColor1,
    transparent: true,
    opacity: 0.15,
  });
  return new THREE.Mesh(geometry, material);
}

const tendrils = [];
for (let i = 0; i < LINE_COUNT; i++) {
  const t = createTendril();
  tendrils.push(t);
  lineGroup.add(t);
}

// ============================================
// RING GEOMETRY (orbital ring around core)
// ============================================
const ringGeometry = new THREE.TorusGeometry(2.2, 0.008, 8, 128);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: SEASON_CONFIG.spring.particleColor1,
  transparent: true,
  opacity: 0.2,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI * 0.45;
ring.rotation.z = Math.PI * 0.1;
scene.add(ring);

const ring2Geometry = new THREE.TorusGeometry(2.6, 0.005, 8, 128);
const ring2Material = new THREE.MeshBasicMaterial({
  color: SEASON_CONFIG.spring.particleColor2,
  transparent: true,
  opacity: 0.12,
});
const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
ring2.rotation.x = Math.PI * 0.7;
ring2.rotation.y = Math.PI * 0.3;
scene.add(ring2);

// ============================================
// ENVIRONMENT MAP (simple gradient)
// ============================================
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
const envGeo = new THREE.SphereGeometry(10, 32, 32);
const envMat = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
  side: THREE.BackSide,
});
envScene.add(new THREE.Mesh(envGeo, envMat));
envScene.add(new THREE.AmbientLight(0xffffff, 1));
const envMap = pmremGenerator.fromScene(envScene).texture;
coreMaterial.envMap = envMap;
pmremGenerator.dispose();

// ============================================
// MORPH THE CORE GEOMETRY WITH NOISE
// ============================================
function morphCore(time, seasonConfig) {
  const positions = coreGeometry.attributes.position.array;
  const speed = seasonConfig.morphSpeed;
  const amp = seasonConfig.morphAmplitude;
  const nScale = seasonConfig.noiseScale;

  for (let i = 0; i < positions.length; i += 3) {
    const ox = originalPositions[i];
    const oy = originalPositions[i + 1];
    const oz = originalPositions[i + 2];

    const n = noise3D(
      ox * nScale + time * speed * 0.3,
      oy * nScale + time * speed * 0.2,
      oz * nScale + time * speed * 0.1
    );

    const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
    const nx = ox / len;
    const ny = oy / len;
    const nz = oz / len;

    positions[i] = ox + nx * n * amp;
    positions[i + 1] = oy + ny * n * amp;
    positions[i + 2] = oz + nz * n * amp;
  }

  coreGeometry.attributes.position.needsUpdate = true;
  coreGeometry.computeVertexNormals();
}

// ============================================
// ANIMATE PARTICLES
// ============================================
function animateParticles(time, seasonConfig) {
  const positions = particleGeometry.attributes.position.array;
  const drift = seasonConfig.particleDrift;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const speed = particleSeeds[i * 4];
    particleSeeds[i * 4 + 1];
    const orbitPhase = particleSeeds[i * 4 + 2];
    const floatPhase = particleSeeds[i * 4 + 3];

    const angle = orbitPhase + time * speed * 60;
    const floatY = Math.sin(time * 0.5 + floatPhase) * 0.15;

    positions[i * 3] += Math.sin(angle) * 0.002 + drift.x;
    positions[i * 3 + 1] += floatY * 0.003 + drift.y;
    positions[i * 3 + 2] += Math.cos(angle) * 0.002 + drift.z;

    const dist = Math.sqrt(
      positions[i * 3] ** 2 +
      positions[i * 3 + 1] ** 2 +
      positions[i * 3 + 2] ** 2
    );

    if (dist > seasonConfig.particleSpread * 2 || dist < 0.5) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = seasonConfig.particleSpread * (0.6 + Math.random() * 0.4);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

// ============================================
// SEASON TRANSITION
// ============================================
function transitionToSeason(newIndex) {
  if (isTransitioning) return;
  isTransitioning = true;

  const season = SEASONS[newIndex];
  const cfg = SEASON_CONFIG[season];
  const body = document.body;
  const tearLines = document.querySelectorAll('.tear-line');

  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
    }
  });

  // Tear in
  tl.to(tearLines, {
    scaleX: 1,
    opacity: 1,
    duration: 0.35,
    stagger: { each: 0.03, from: 'random' },
    ease: 'power3.in',
  });

  // At peak, swap theme
  tl.call(() => {
    body.dataset.season = season;
    updateSeasonUI(season, cfg);
    updateThreeColors(cfg);
  }, null, '+=0.05');

  // Tear out
  tl.to(tearLines, {
    scaleX: 0,
    duration: 0.4,
    stagger: { each: 0.03, from: 'random' },
    ease: 'power3.out',
    onComplete: () => {
      gsap.set(tearLines, { opacity: 0, transformOrigin: 'left center' });
      tearLines.forEach(line => {
        const current = line.style.transformOrigin || 'left center';
        line.style.transformOrigin = current.includes('left') ? 'right center' : 'left center';
      });
    }
  }, '+=0.05');

  // Glitch text effect
  tl.to('.hero-line', {
    skewX: () => gsap.utils.random(-3, 3),
    x: () => gsap.utils.random(-10, 10),
    duration: 0.15,
    stagger: 0.02,
    ease: 'power2.inOut',
  }, 0.2);

  tl.to('.hero-line', {
    skewX: 0,
    x: 0,
    duration: 0.4,
    stagger: 0.02,
    ease: 'power3.out',
  }, 0.5);
}

const SEASON_ABBR = { spring: 'SP', summer: 'SM', autumn: 'AU', winter: 'WN' };
const DIAL_ROTATIONS = { spring: 0, summer: 90, autumn: 180, winter: 270 };

function updateSeasonUI(season, cfg) {
  // Floating season label
  document.getElementById('seasonName').textContent = cfg.name;
  document.getElementById('seasonPhase').textContent = cfg.phase;

  // Epoch badge
  document.getElementById('epochBadge').textContent = `${String(cfg.index + 1).padStart(2, '0')} / 04`;

  // Dial
  document.getElementById('dialAbbr').textContent = SEASON_ABBR[season];
  document.getElementById('dialLabel').textContent = cfg.name;
  document.getElementById('dialNeedle').style.transform =
    `translate(-50%, -100%) rotate(${DIAL_ROTATIONS[season]}deg)`;

  // Dial markers
  document.querySelectorAll('.dial-marker').forEach((m, i) => {
    m.classList.toggle('active', i === cfg.index);
  });

  // Side timeline
  const progress = document.getElementById('timelineProgress');
  if (progress) {
    progress.style.top = `${cfg.index * 25}%`;
  }
  document.querySelectorAll('.tl-label').forEach((label, i) => {
    label.classList.toggle('active', i === cfg.index);
  });

  // Update statement card
  updateStmtCard(season);
}

function updateThreeColors(cfg) {
  gsap.to(coreMaterial.color, {
    r: cfg.coreColor.r, g: cfg.coreColor.g, b: cfg.coreColor.b,
    duration: 1.2, ease: 'power2.inOut'
  });

  gsap.to(glowMaterial.color, {
    r: cfg.glowColor.r, g: cfg.glowColor.g, b: cfg.glowColor.b,
    duration: 1.2, ease: 'power2.inOut'
  });

  gsap.to(pointLight1.color, {
    r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b,
    duration: 1.2, ease: 'power2.inOut'
  });

  gsap.to(pointLight2.color, {
    r: cfg.particleColor2.r, g: cfg.particleColor2.g, b: cfg.particleColor2.b,
    duration: 1.2, ease: 'power2.inOut'
  });

  gsap.to(ringMaterial.color, {
    r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b,
    duration: 1, ease: 'power2.inOut'
  });

  gsap.to(ring2Material.color, {
    r: cfg.particleColor2.r, g: cfg.particleColor2.g, b: cfg.particleColor2.b,
    duration: 1, ease: 'power2.inOut'
  });

  // Animate particle colors
  const colors = particleGeometry.attributes.color.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const choice = Math.random();
    const col = choice < 0.4 ? cfg.particleColor1 :
                choice < 0.7 ? cfg.particleColor2 : cfg.particleColor3;

    gsap.to(colors, {
      [i * 3]: col.r,
      [i * 3 + 1]: col.g,
      [i * 3 + 2]: col.b,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        particleGeometry.attributes.color.needsUpdate = true;
      }
    });
  }

  // Update tendril colors
  tendrils.forEach(t => {
    gsap.to(t.material.color, {
      r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b,
      duration: 1.2, ease: 'power2.inOut'
    });
  });

  // Material adjustments per season
  if (cfg.name === 'WINTER') {
    gsap.to(coreMaterial, { metalness: 0.3, roughness: 0.2, transmission: 0.3, clearcoat: 0.8, duration: 1.2 });
    gsap.to(glowMaterial, { opacity: 0.04, duration: 1.2 });
  } else if (cfg.name === 'SUMMER') {
    gsap.to(coreMaterial, { metalness: 0.05, roughness: 0.4, transmission: 0.2, clearcoat: 0.3, duration: 1.2 });
    gsap.to(glowMaterial, { opacity: 0.12, duration: 1.2 });
  } else if (cfg.name === 'AUTUMN') {
    gsap.to(coreMaterial, { metalness: 0.15, roughness: 0.6, transmission: 0.05, clearcoat: 0.2, duration: 1.2 });
    gsap.to(glowMaterial, { opacity: 0.06, duration: 1.2 });
  } else {
    gsap.to(coreMaterial, { metalness: 0.1, roughness: 0.5, transmission: 0.15, clearcoat: 0.4, duration: 1.2 });
    gsap.to(glowMaterial, { opacity: 0.08, duration: 1.2 });
  }
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
  const reveals = document.querySelectorAll('[data-scroll-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

// ============================================
// GSAP SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  // Parallax the 3D scene on scroll
  gsap.to(camera.position, {
    y: -2,
    scrollTrigger: {
      trigger: '.section-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // Fade core on scroll
  gsap.to(coreMaterial, {
    opacity: 0.3,
    scrollTrigger: {
      trigger: '.section-statement',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    }
  });

  // Bring back for epochs
  gsap.to(coreMaterial, {
    opacity: 0.92,
    scrollTrigger: {
      trigger: '.section-epochs',
      start: 'top center',
      end: 'top top',
      scrub: 1,
    }
  });

  // Epoch cards stagger
  gsap.from('.epoch-card', {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.epochs-grid',
      start: 'top 80%',
    }
  });

  // Floating season fade in
  gsap.from('.floating-season', {
    opacity: 0,
    y: 20,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.8,
  });

  // Side timeline fade in
  gsap.from('.side-timeline', {
    opacity: 0,
    x: 20,
    duration: 1,
    ease: 'power3.out',
    delay: 1,
  });
}

// ============================================
// MOUSE TRACKING
// ============================================
function onMouseMove(e) {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
}

// ============================================
// RESIZE
// ============================================
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  const season = SEASONS[currentSeasonIndex];
  const cfg = SEASON_CONFIG[season];

  // Smooth mouse
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Morph core
  morphCore(time, cfg);

  // Core rotation with mouse influence
  coreMesh.rotation.y += cfg.rotationSpeed;
  coreMesh.rotation.x += cfg.rotationSpeed * 0.5;
  coreMesh.rotation.y += mouse.x * 0.002;
  coreMesh.rotation.x += mouse.y * 0.001;

  // Core scale
  const targetScale = cfg.coreScale + Math.sin(time * 0.5) * 0.03;
  coreMesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.02);

  // Glow follows core
  glowMesh.rotation.copy(coreMesh.rotation);
  glowMesh.scale.copy(coreMesh.scale).multiplyScalar(0.7);

  // Animate particles
  animateParticles(time, cfg);
  particleMaterial.uniforms.uTime.value = time;

  // Rotate particle system subtly
  particleSystem.rotation.y += 0.0003;
  particleSystem.rotation.x += 0.0001;

  // Ring animation
  ring.rotation.z += 0.001;
  ring2.rotation.z -= 0.0008;
  ring2.rotation.x += 0.0003;

  // Tendril group rotation
  lineGroup.rotation.y += 0.0005;
  lineGroup.rotation.x = Math.sin(time * 0.2) * 0.1;

  // Camera subtle movement
  camera.position.x = 0.8 + mouse.x * 0.3;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// ============================================
// EPOCH CARD INTERACTIONS
// ============================================
function initEpochCards() {
  document.querySelectorAll('.epoch-card').forEach(card => {
    card.addEventListener('click', () => {
      const epoch = card.dataset.epoch;
      const index = SEASONS.indexOf(epoch);
      if (index !== -1 && index !== currentSeasonIndex) {
        currentSeasonIndex = index;
        transitionToSeason(currentSeasonIndex);
      }
    });
  });
}

// ============================================
// EPOCH CARD 2D CANVAS VISUALS
// ============================================
function initEpochVisuals() {
  const ids = ['epochVisual1', 'epochVisual2', 'epochVisual3', 'epochVisual4'];
  const seasons = ['spring', 'summer', 'autumn', 'winter'];

  ids.forEach((id, idx) => {
    const container = document.getElementById(id);
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 140;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const cfg = SEASON_CONFIG[seasons[idx]];

    function draw() {
      ctx.clearRect(0, 0, 300, 140);
      const t = performance.now() * 0.001;

      if (idx === 0) {
        // Spring: flowing wave lines
        ctx.strokeStyle = `rgb(${Math.round(cfg.particleColor1.r * 255)}, ${Math.round(cfg.particleColor1.g * 255)}, ${Math.round(cfg.particleColor1.b * 255)})`;
        ctx.lineWidth = 1.5;
        for (let l = 0; l < 8; l++) {
          ctx.beginPath();
          for (let x = 0; x < 300; x += 3) {
            const y = 70 + Math.sin(x * 0.02 + t + l * 0.8) * (20 + l * 5) * Math.sin(t * 0.5 + l);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.globalAlpha = 0.3 + (l / 8) * 0.3;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (idx === 1) {
        // Summer: orbiting sparks spiral
        for (let i = 0; i < 60; i++) {
          const angle = (i / 60) * Math.PI * 2 + t * 0.3;
          const r = 20 + Math.sin(t + i * 0.5) * 15 + i * 0.5;
          const x = 150 + Math.cos(angle) * r;
          const y = 70 + Math.sin(angle) * r;
          const s = 1 + Math.sin(t * 2 + i) * 1;
          ctx.fillStyle = `rgba(${Math.round(cfg.particleColor1.r * 255)}, ${Math.round(cfg.particleColor1.g * 255)}, ${Math.round(cfg.particleColor1.b * 255)}, ${0.3 + Math.sin(t + i) * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(s, 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (idx === 2) {
        // Autumn: falling leaf particles
        ctx.fillStyle = `rgb(${Math.round(cfg.particleColor1.r * 255)}, ${Math.round(cfg.particleColor1.g * 255)}, ${Math.round(cfg.particleColor1.b * 255)})`;
        for (let i = 0; i < 30; i++) {
          const x = (i * 37 + t * 20) % 300;
          const y = (i * 23 + t * (15 + i * 0.5)) % 140;
          const s = 1 + Math.sin(i + t) * 0.8;
          ctx.globalAlpha = 0.2 + Math.sin(t + i * 0.7) * 0.15;
          ctx.fillRect(x - s, y - s, s * 2, s * 2);
        }
        ctx.globalAlpha = 1;
      } else {
        // Winter: crystalline lines
        ctx.strokeStyle = `rgb(${Math.round(cfg.particleColor1.r * 255)}, ${Math.round(cfg.particleColor1.g * 255)}, ${Math.round(cfg.particleColor1.b * 255)})`;
        ctx.lineWidth = 0.8;
        const cx = 150, cy = 70;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + t * 0.1;
          const r = 30 + Math.sin(t * 0.5 + i * 1.2) * 20;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          ctx.globalAlpha = 0.2 + Math.sin(t + i * 0.5) * 0.15;
          ctx.stroke();
          // Branch
          const bx = cx + Math.cos(angle) * r * 0.6;
          const by = cy + Math.sin(angle) * r * 0.6;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle + 0.5) * r * 0.3, by + Math.sin(angle + 0.5) * r * 0.3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    }
    draw();
  });
}

// ============================================
// CUSTOM CURSOR — comet trail + gap crosshair
// ============================================
function initCursor() {
  const cvs = document.createElement('canvas');
  cvs.id = 'cursor-canvas';
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');

  let tx = -200, ty = -200;
  let lx = -200, ly = -200;
  let hovering = false;
  const trail = [];
  const TRAIL_LEN = 10;

  const SEASON_COLORS = {
    spring: [74, 124, 89],
    summer: [232, 160, 37],
    autumn: [196, 98, 42],
    winter: [90, 143, 180],
  };

  function resize() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  document.querySelectorAll('button, a, .epoch-card, .season-dial, .tl-label').forEach(el => {
    el.addEventListener('mouseenter', () => { hovering = true; });
    el.addEventListener('mouseleave', () => { hovering = false; });
  });

  function draw() {
    lx += (tx - lx) * 0.42;
    ly += (ty - ly) * 0.42;

    trail.push({ x: lx, y: ly });
    if (trail.length > TRAIL_LEN) trail.shift();

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    const season = document.body.dataset.season || 'winter';
    const [r, g, b] = SEASON_COLORS[season];

    // Comet trail
    trail.forEach((pt, i) => {
      const p = i / TRAIL_LEN;
      ctx.globalAlpha = p * 0.35;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Gap crosshair (NOT a circle)
    if (tx > -100) {
      const arm = hovering ? 10 : 6;
      const gap = hovering ? 5 : 3;
      ctx.globalAlpha = hovering ? 1 : 0.75;
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx - arm - gap, ly); ctx.lineTo(lx - gap, ly);
      ctx.moveTo(lx + gap, ly);       ctx.lineTo(lx + arm + gap, ly);
      ctx.moveTo(lx, ly - arm - gap); ctx.lineTo(lx, ly - gap);
      ctx.moveTo(lx, ly + gap);       ctx.lineTo(lx, ly + arm + gap);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================
// HELPERS
// ============================================
function toRGBA(color, alpha) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================
// STMT RING CANVAS — season dial
// ============================================
function initStmtRing() {
  const cvs = document.getElementById('stmtRingCanvas');
  if (!cvs) return;
  const S = 160;
  const DPR = Math.min(window.devicePixelRatio, 2);
  cvs.width = S * DPR;
  cvs.height = S * DPR;
  const ctx = cvs.getContext('2d');
  ctx.scale(DPR, DPR);
  const cx = S / 2, cy = S / 2;
  const outerR = S / 2 - 14;

  const FILL = { spring: 0.25, summer: 0.5, autumn: 0.75, winter: 1.0 };

  function draw() {
    ctx.clearRect(0, 0, S, S);
    const season = document.body.dataset.season || 'spring';
    const cfg = SEASON_CONFIG[season];
    const t = performance.now() * 0.001;
    const fill = FILL[season];

    // Outer track ring
    ctx.strokeStyle = toRGBA(cfg.particleColor1, 0.12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // 12 tick marks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isMajor = i % 3 === 0;
      ctx.strokeStyle = toRGBA(cfg.particleColor1, isMajor ? 0.45 : 0.18);
      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      const r0 = outerR - (isMajor ? 7 : 4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      ctx.stroke();
    }

    // Season arc
    const arcEnd = fill >= 1.0 ? Math.PI * 1.9999 * 2 / 2 + Math.PI * 2 / 2 : -Math.PI / 2 + Math.PI * 2 * fill;
    ctx.strokeStyle = toRGBA(cfg.particleColor1, 0.75);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 8, -Math.PI / 2, fill >= 1.0 ? Math.PI * 1.5 : arcEnd);
    ctx.stroke();

    // Arc head dot
    const headAngle = fill >= 1.0 ? Math.PI * 1.5 : -Math.PI / 2 + Math.PI * 2 * fill;
    ctx.fillStyle = toRGBA(cfg.particleColor2, 0.9);
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(headAngle) * (outerR - 8),
      cy + Math.sin(headAngle) * (outerR - 8),
      3.5, 0, Math.PI * 2
    );
    ctx.fill();

    // Inner orbit ring
    ctx.strokeStyle = toRGBA(cfg.particleColor1, 0.06);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 22, 0, Math.PI * 2);
    ctx.stroke();

    // 4 orbiting motes
    for (let i = 0; i < 4; i++) {
      const a = t * 0.4 + (i / 4) * Math.PI * 2;
      const r = outerR - 22;
      const alpha = 0.25 + Math.sin(t * 0.8 + i) * 0.12;
      ctx.fillStyle = toRGBA(cfg.particleColor2, alpha);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================
// STMT CARD — bar animations + scan line
// ============================================
function initStmtCard() {
  // Initial bar fill (spring)
  const season = document.body.dataset.season || 'spring';
  _animateStmtBars(season, true);

  // Scroll trigger for entrance
  ScrollTrigger.create({
    trigger: '#stmtCard',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from('#stmtCard', {
        x: -50,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
      });
      // Bars animate in with delay
      setTimeout(() => _animateStmtBars(document.body.dataset.season || 'spring'), 400);
    }
  });

  // Periodic scan-line
  _runScanLine();
}

function _animateStmtBars(season, instant = false) {
  const bars = SEASON_BARS[season];
  const ids = ['stmtBarA', 'stmtBarB', 'stmtBarC'];
  const valIds = ['stmtValA', 'stmtValB', 'stmtValC'];
  const keys = ['a', 'b', 'c'];

  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = bars[keys[i]];
    if (instant) {
      el.style.transform = `scaleX(${target})`;
    } else {
      el.style.transform = 'scaleX(0)';
      animeAnimate(el, {
        scaleX: target,
        duration: 1000 + i * 120,
        delay: i * 80,
        ease: 'outElastic(1, .7)',
      });
      // Animate percentage text
      const valEl = document.getElementById(valIds[i]);
      if (valEl) {
        const pct = Math.round(target * 100);
        let count = 0;
        const step = Math.ceil(pct / 18);
        const iv = setInterval(() => {
          count = Math.min(count + step, pct);
          valEl.textContent = count + '%';
          if (count >= pct) clearInterval(iv);
        }, 55);
      }
    }
  });
}

function _runScanLine() {
  const card = document.getElementById('stmtCard');
  if (!card) return;
  const scanEl = document.createElement('div');
  scanEl.style.cssText = `
    position:absolute;top:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,var(--accent),transparent);
    opacity:0;pointer-events:none;z-index:10;
  `;
  card.appendChild(scanEl);

  function runScan() {
    gsap.fromTo(scanEl,
      { top: 0, opacity: 0 },
      {
        top: '100%',
        opacity: 0.5,
        duration: 1.4,
        ease: 'power1.inOut',
        onStart: () => gsap.to(scanEl, { opacity: 0.5, duration: 0.2 }),
        onComplete: () => {
          gsap.set(scanEl, { opacity: 0 });
          setTimeout(runScan, gsap.utils.random(5000, 9000));
        }
      }
    );
  }
  setTimeout(runScan, 2000);
}

// ============================================
// STMT TEXT — entrance + interactions
// ============================================
function initStmtText() {
  const lines = document.querySelectorAll('.stmt-line');
  const rule = document.getElementById('stmtRule');
  const linesWrap = document.getElementById('stmtLines');

  // GSAP ScrollTrigger entrance
  ScrollTrigger.create({
    trigger: '#stmtTextArea',
    start: 'top 72%',
    once: true,
    onEnter: () => {
      // Staggered line entrance
      gsap.to('.stmt-line-inner', {
        translateY: '0%',
        opacity: 1,
        duration: 1.05,
        stagger: 0.11,
        ease: 'power4.out',
      });

      // Rule draws in after text
      gsap.to(rule, {
        scaleX: 1,
        duration: 1.2,
        delay: 0.8,
        ease: 'power3.out',
      });

      // Anime.js character scramble on em-highlights (spans already split by _initEmInteractions)
      setTimeout(() => _scrambleEmTexts(), 650);
    }
  });

  // Line hover: focus effect
  lines.forEach(line => {
    line.addEventListener('mouseenter', () => {
      linesWrap.classList.add('line-focused');
      line.classList.add('stmt-line--hovered');
      gsap.to(line.querySelector('.stmt-line-inner'), {
        y: -4,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    line.addEventListener('mouseleave', () => {
      linesWrap.classList.remove('line-focused');
      line.classList.remove('stmt-line--hovered');
      gsap.to(line.querySelector('.stmt-line-inner'), {
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });

  // Em-highlight: flood reveal + char magnetic
  _initEmInteractions();
}

function _scrambleEmTexts() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Scramble per-span (spans already created by _initEmInteractions)
  document.querySelectorAll('.stmt-em-text').forEach(el => {
    const spans = Array.from(el.querySelectorAll('span'));
    if (!spans.length) return;
    spans.forEach((span, i) => {
      const finalChar = span.dataset.orig;
      if (!finalChar || finalChar === '\u00a0') return;
      let frame = 0;
      const maxF = 18;
      const iv = setInterval(() => {
        frame++;
        if (frame >= maxF || frame > (i / spans.length) * maxF + 6) {
          span.textContent = finalChar;
          clearInterval(iv);
          return;
        }
        span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
      }, 38);
    });
  });
}

function _initEmInteractions() {
  document.querySelectorAll('.stmt-em').forEach(em => {
    const flood = em.querySelector('.stmt-em-flood');
    const textEl = em.querySelector('.stmt-em-text');

    // Split text into character spans for scramble + magnetic effect
    const original = textEl.textContent;
    textEl.innerHTML = original.split('').map(c => {
      const display = c === ' ' ? '&nbsp;' : c;
      const orig = c === ' ' ? '\u00a0' : c;
      return `<span data-orig="${orig}" style="display:inline-block;will-change:transform">${display}</span>`;
    }).join('');

    const charSpans = textEl.querySelectorAll('span');

    // Flood reveal on hover
    em.addEventListener('mouseenter', () => {
      gsap.fromTo(flood,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.4, ease: 'power3.out' }
      );
    });

    em.addEventListener('mousemove', (e) => {
      charSpans.forEach(span => {
        const r = span.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
        const maxD = 80;
        if (dist < maxD) {
          const t = 1 - dist / maxD;
          const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
          gsap.to(span, {
            x: Math.cos(angle) * t * 10,
            y: Math.cos(angle) * t * 4,
            scaleX: 1 + t * 0.25,
            duration: 0.18,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(span, { x: 0, y: 0, scaleX: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    });

    em.addEventListener('mouseleave', () => {
      // Drain flood from right
      gsap.to(flood, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.set(flood, { transformOrigin: 'left center' }),
      });
      // Reset chars with spring
      gsap.to(charSpans, { x: 0, y: 0, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', stagger: 0.015 });
    });
  });
}

// Called on season change — updates card content
function updateStmtCard(season) {
  const cfg = SEASON_CONFIG[season];
  const el = (id) => document.getElementById(id);

  if (el('stmtNum'))        el('stmtNum').textContent = SEASON_NUMS[season];
  if (el('stmtSeasonTag'))  el('stmtSeasonTag').textContent = cfg.name;
  if (el('stmtRingName'))   el('stmtRingName').textContent = cfg.name;
  if (el('stmtRingPhase'))  el('stmtRingPhase').textContent = cfg.phase;

  // Quote cross-fade
  const bqEl = el('stmtBqText');
  if (bqEl) {
    gsap.to(bqEl, { opacity: 0, y: -6, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        bqEl.textContent = SEASON_QUOTES[season];
        gsap.to(bqEl, { opacity: 0.6, y: 0, duration: 0.35, ease: 'power2.out' });
      }
    });
  }

  // Re-animate bars
  _animateStmtBars(season);
}

// ============================================
// INIT
// ============================================
function init() {
  // Set initial active states
  document.querySelector('.dm-1')?.classList.add('active');

  // Event listeners
  document.getElementById('shiftBtn').addEventListener('click', () => {
    currentSeasonIndex = (currentSeasonIndex + 1) % 4;
    transitionToSeason(currentSeasonIndex);
  });

  // Keyboard support for dial
  document.getElementById('shiftBtn').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      currentSeasonIndex = (currentSeasonIndex + 1) % 4;
      transitionToSeason(currentSeasonIndex);
    }
  });

  document.getElementById('topBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Side timeline label clicks
  document.querySelectorAll('.tl-label').forEach(label => {
    label.addEventListener('click', () => {
      const target = label.dataset.target;
      const index = SEASONS.indexOf(target);
      if (index !== -1 && index !== currentSeasonIndex) {
        currentSeasonIndex = index;
        transitionToSeason(currentSeasonIndex);
      }
    });
  });

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  // Start systems
  initScrollReveal();
  initScrollAnimations();
  initEpochCards();
  initEpochVisuals();
  initStmtRing();
  initStmtCard();
  initStmtText();
  initCursor();

  // Initial reveal animation - cinematic entrance
  const entranceTL = gsap.timeline({ delay: 0.3 });

  entranceTL
    .from('.logo', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' }, 0)
    .from('.season-dial', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' }, 0.1)
    .from('.epoch-badge', { y: -30, opacity: 0, duration: 1, ease: 'power3.out' }, 0.15)
    .from('.hero-marquee', { opacity: 0, y: 20, duration: 1, ease: 'power3.out' }, 0.6)
    .call(() => {
      document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('revealed');
        }
      });
    }, null, 0.5);

  // Floating animation on season label
  gsap.to('.floating-season', {
    y: -8,
    duration: 4,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // Start render loop
  animate();
}

init();
