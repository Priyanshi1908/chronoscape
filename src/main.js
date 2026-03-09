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
    rotationSpeed: 0.001,
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
    rotationSpeed: 0.0018,
    coreScale: 1.18,
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
    rotationSpeed: 0.0007,
    coreScale: 0.92,
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
    rotationSpeed: 0.00015,
    coreScale: 0.86,
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
// SCULPT CONFIG — per-season GLSL shader params
// ============================================
const SCULPT_CONFIG = {
  spring: {
    noiseAmp: 0.28, noiseFreq: 1.0, noiseSpeed: 0.42,
    detailAmp: 0.06, detailFreq: 2.8,
    color1: new THREE.Color(0x5db86e), color2: new THREE.Color(0xe8d5c8), colorDark: new THREE.Color(0x0f2e18),
    fresnelPow: 2.8, fresnelStr: 0.65, emissiveStr: 0.06,
  },
  summer: {
    noiseAmp: 0.62, noiseFreq: 0.68, noiseSpeed: 0.55,
    detailAmp: 0.16, detailFreq: 3.2,
    color1: new THREE.Color(0xf7c325), color2: new THREE.Color(0xf56e1a), colorDark: new THREE.Color(0x6a2800),
    fresnelPow: 1.6, fresnelStr: 1.05, emissiveStr: 0.38,
  },
  autumn: {
    noiseAmp: 0.36, noiseFreq: 1.75, noiseSpeed: 0.30,
    detailAmp: 0.10, detailFreq: 6.5,
    color1: new THREE.Color(0xd4501a), color2: new THREE.Color(0x7a1e2a), colorDark: new THREE.Color(0x180506),
    fresnelPow: 4.2, fresnelStr: 0.36, emissiveStr: 0.07,
  },
  winter: {
    noiseAmp: 0.015, noiseFreq: 1.0, noiseSpeed: 0.05,
    detailAmp: 0.005, detailFreq: 2.0,
    color1: new THREE.Color(0x8cc8f0), color2: new THREE.Color(0x3a6898), colorDark: new THREE.Color(0x020810),
    fresnelPow: 6.5, fresnelStr: 1.3, emissiveStr: 0.48,
  },
};

// ============================================
// STATE
// ============================================
let currentSeasonIndex = 0;
let isTransitioning = false;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let clock = new THREE.Clock();
let scrollProgress = 0;
let rotationDir = 1;       // 1 = clockwise (scroll down), -1 = anticlockwise (scroll up)
let signedRotSpeed = 0;    // single signed value — lerps through zero so no sudden flip
const blobRaycaster = new THREE.Raycaster();
const ripplePointer = new THREE.Vector2();


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

// ============================================
// GLSL SHADER MATERIAL — GPU displacement blob
// ============================================
const _VERT_NOISE = `
  vec3 mod289v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289v4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute4(vec4 x){return mod289v4(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt4(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289v3(i);
    vec4 p=permute4(permute4(permute4(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 xv=x_*ns.x+ns.yyyy;
    vec4 yv=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(xv)-abs(yv);
    vec4 b0=vec4(xv.xy,yv.xy);
    vec4 b1=vec4(xv.zw,yv.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt4(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

// Voronoi / Worley noise — crystal cell boundaries (crack lines)
const _VORONOI = `
  vec2 voronoi3D(vec3 x){
    vec3 p=floor(x),f=fract(x);
    float va=8.0,vb=8.0;
    for(int k=-1;k<=1;k++)
    for(int j=-1;j<=1;j++)
    for(int i=-1;i<=1;i++){
      vec3 g=vec3(float(i),float(j),float(k));
      vec3 o=fract(sin(vec3(
        dot(p+g,vec3(127.1,311.7,74.7)),
        dot(p+g,vec3(269.5,183.3,246.1)),
        dot(p+g,vec3(113.5,271.9,124.6))
      ))*43758.5453);
      vec3 r=g-f+o; float d=dot(r,r);
      if(d<va){vb=va;va=d;}else if(d<vb){vb=d;}
    }
    return vec2(sqrt(va),sqrt(vb));
  }
`;

const coreShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime:          { value: 0 },
    uNoiseAmp:      { value: 0.28 },
    uNoiseFreq:     { value: 1.0 },
    uNoiseSpeed:    { value: 0.42 },
    uDetailAmp:     { value: 0.06 },
    uDetailFreq:    { value: 2.8 },
    uColor1:        { value: new THREE.Color(0x5db86e) },
    uColor2:        { value: new THREE.Color(0xe8d5c8) },
    uColorDark:     { value: new THREE.Color(0x0f2e18) },
    uFresnelPow:    { value: 2.8 },
    uFresnelStr:    { value: 0.65 },
    uEmissiveStr:   { value: 0.06 },
    uGlobalAlpha:   { value: 1.0 },
    uScrollProgress:{ value: 0.0 },
    uRipplePos:     { value: new THREE.Vector3(999, 999, 999) },
    uRippleAge:     { value: 99.0 },
    uFreezeProgress:{ value: 0.0 },
  },
  vertexShader: _VERT_NOISE + _VORONOI + `
    uniform float uTime;
    uniform float uNoiseAmp;
    uniform float uNoiseFreq;
    uniform float uNoiseSpeed;
    uniform float uDetailAmp;
    uniform float uDetailFreq;
    uniform vec3  uRipplePos;
    uniform float uRippleAge;
    uniform float uFreezeProgress;

    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying float vDisp;
    varying float vFreezeAmt;

    void main() {
      vec3 pos = position;
      vec3 n   = normalize(normal);

      // Primary + detail noise displacement
      float n1 = snoise(pos * uNoiseFreq + uTime * uNoiseSpeed);
      float n2 = snoise(pos * uDetailFreq + uTime * uNoiseSpeed * 1.8 + vec3(17.5, 3.2, 8.1));
      float disp = n1 * uNoiseAmp + n2 * uDetailAmp;

      // Idle breath
      disp += sin(uTime * 0.38) * 0.022;

      // Cursor ripple (world-space)
      vec3 wInit = (modelMatrix * vec4(pos, 1.0)).xyz;
      float rDist = length(wInit - uRipplePos);
      disp += sin(rDist * 6.0 - uRippleAge * 5.0) * exp(-rDist * 1.8) * exp(-uRippleAge * 2.5) * 0.18;

      // ── Winter crystallization ──
      float frzY     = normalize(pos).y;
      float frzFront = uFreezeProgress * 2.4 - 1.2;
      float frzAmount = (1.0 - smoothstep(frzFront - 0.06, frzFront + 0.18, frzY))
                      * step(0.001, uFreezeProgress);

      // Subtle crystal facets: quantized noise → slight geometric variation (NOT spiky)
      float plateN    = snoise(pos * 2.8 + vec3(20.5, 11.3, 7.1));
      float plateFacet = (floor(plateN * 5.0) / 5.0) * 0.07;

      // Frost micro-roughness (bumpy frosted-glass surface texture)
      float frostMicro = snoise(pos * 8.0 + vec3(80.0)) * 0.022
                       + snoise(pos * 16.0 + vec3(160.0)) * 0.010;

      float crystalDisp = plateFacet + frostMicro;

      // Active freeze-front shimmer (ripple at the freezing boundary)
      float frzFrontProx = max(0.0, 1.0 - abs(frzY - frzFront) * 8.0)
                         * step(0.02, uFreezeProgress) * step(uFreezeProgress, 0.98);
      float frzShimmer = sin(frzY * 20.0 + uTime * 12.0) * frzFrontProx * 0.022;

      disp = mix(disp, crystalDisp, frzAmount) + frzShimmer;
      vFreezeAmt = frzAmount;

      // ── Normal correction via noise gradient (central differences) ──
      float eps = 0.025;
      float dNx = snoise((pos + vec3(eps,0,0)) * uNoiseFreq + uTime * uNoiseSpeed)
                - snoise((pos - vec3(eps,0,0)) * uNoiseFreq + uTime * uNoiseSpeed);
      float dNy = snoise((pos + vec3(0,eps,0)) * uNoiseFreq + uTime * uNoiseSpeed)
                - snoise((pos - vec3(0,eps,0)) * uNoiseFreq + uTime * uNoiseSpeed);
      float dNz = snoise((pos + vec3(0,0,eps)) * uNoiseFreq + uTime * uNoiseSpeed)
                - snoise((pos - vec3(0,0,eps)) * uNoiseFreq + uTime * uNoiseSpeed);
      vec3 noiseGrad   = vec3(dNx, dNy, dNz) / (2.0 * eps);
      vec3 correctedN  = normalize(n - uNoiseAmp * noiseGrad);

      pos      += n * disp;
      vDisp     = disp;
      vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      vNormal   = normalize(normalMatrix * correctedN);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: _VERT_NOISE + _VORONOI + `
    uniform vec3  uColor1;
    uniform vec3  uColor2;
    uniform vec3  uColorDark;
    uniform float uFresnelPow;
    uniform float uFresnelStr;
    uniform float uEmissiveStr;
    uniform float uTime;
    uniform float uGlobalAlpha;
    uniform float uFreezeProgress;

    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying float vDisp;
    varying float vFreezeAmt;

    void main() {
      vec3 norm    = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float NdotV  = max(dot(norm, viewDir), 0.0);
      float frozen  = vFreezeAmt;

      // ── Base color (water/organic blob) ──
      float t = clamp(vWorldPos.y * 0.55 + 0.5, 0.0, 1.0);
      vec3 baseColor = mix(uColorDark, mix(uColor2, uColor1, t), t * 0.85 + 0.15);
      float dispN = clamp(vDisp * 1.6 + 0.45, 0.0, 1.0);
      baseColor = mix(baseColor, uColor1 * 1.15, dispN * 0.16);

      // ── Frosted ice glass material ──
      // Layered frost noise — organic surface variation like frosted glass
      float frostN1 = snoise(vWorldPos * 5.5 + vec3(100.0)) * 0.5 + 0.5;
      float frostN2 = snoise(vWorldPos * 11.0 + vec3(200.0)) * 0.5 + 0.5;
      float frostN3 = snoise(vWorldPos * 22.0 + vec3(300.0)) * 0.5 + 0.5;
      float frostPattern = frostN1 * 0.50 + frostN2 * 0.32 + frostN3 * 0.18;

      // Outer frost surface: milky blue-white
      vec3 frostSurface = mix(vec3(0.48, 0.64, 0.88), vec3(0.88, 0.93, 1.0), frostPattern);

      // Inner ice glow: the blue depth you see when light passes through ice
      float iceInnerN = snoise(vWorldPos * 2.2 + vec3(55.0)) * 0.5 + 0.5;
      vec3 iceInner   = mix(vec3(0.06, 0.22, 0.58), vec3(0.28, 0.55, 0.90), iceInnerN);

      // Blend: inner glow shows more at grazing angles (like translucent ice)
      float rimBlend  = 1.0 - NdotV;
      vec3 frostColor = mix(iceInner, frostSurface, 0.60 + rimBlend * 0.25);

      // Very faint frost crystal lines (subtle structure, no glow — just slight darkening)
      vec2  frzV       = voronoi3D(vWorldPos * 2.8 + vec3(10.0));
      float frostLine  = 1.0 - smoothstep(0.0, 0.12, frzV.y - frzV.x);
      frostColor = mix(frostColor, frostColor * 0.68, frostLine * 0.30);

      // Apply frost over base
      baseColor = mix(baseColor, frostColor, frozen);

      // Fresnel — ice has strong rim highlighting
      float fresnel  = pow(1.0 - NdotV, uFresnelPow);
      vec3  rimColor = mix(
        uColor1 * 1.6,
        mix(vec3(0.72, 0.88, 1.0), vec3(1.0), 0.5),
        frozen
      );
      baseColor = mix(baseColor, rimColor, fresnel * mix(uFresnelStr, uFresnelStr * 1.4, frozen));

      // ── Lighting ──
      vec3  kLight = normalize(vec3(2.5, 4.0, 3.5));
      float NdotL  = max(dot(norm, kLight), 0.0);
      vec3  fLight = normalize(vec3(-1.8, 0.5, 2.0));
      float NdotF  = max(dot(norm, fLight), 0.0) * 0.20;
      vec3  bLight = normalize(vec3(1.0, -0.5, -3.0));
      float NdotB  = max(dot(norm, bLight), 0.0) * 0.12;

      // Frosted glass scatters more light uniformly (boosted ambient)
      float ambient = mix(0.06, 0.16, frozen);
      vec3 diffuse = baseColor * (ambient + NdotL * 0.80 + NdotF + NdotB);

      vec3  halfDir = normalize(kLight + viewDir);

      // Broad soft specular (frosted surface scatters specular)
      float specBroad = pow(max(dot(norm, halfDir), 0.0), 24.0);
      diffuse += specBroad * mix(0.18, 0.35, frozen) * mix(vec3(1.0), vec3(0.80, 0.92, 1.0), frozen);

      // Tight specular (ice glint)
      float specTight = pow(max(dot(norm, halfDir), 0.0), 110.0);
      diffuse += specTight * mix(0.55, 0.90, frozen) * mix(vec3(1.0), vec3(0.82, 0.94, 1.0), frozen);

      // Ice sparkle (small scattered sharp glints — like snow crystals catching light)
      float sparkleN = snoise(vWorldPos * 20.0 + vec3(77.0));
      float sparkle  = pow(max(sparkleN, 0.0), 16.0) * frozen * 1.6;
      diffuse += sparkle * vec3(0.85, 0.93, 1.0);

      // Subsurface ice depth glow (blue light bleeding through from interior)
      float iceSSS = (1.0 - NdotL * 0.5) * frozen * 0.22;
      diffuse += vec3(0.04, 0.18, 0.50) * iceSSS;

      // ── Emissive (fades on frozen — ice doesn't glow warmly) ──
      float pulse   = 0.75 + sin(uTime * 0.7) * 0.25;
      vec3  emissive = uColor1 * uEmissiveStr * (0.35 + dispN * 0.65) * pulse
                     * mix(1.0, 0.08, frozen);

      float alpha = (0.90 + fresnel * 0.09) * uGlobalAlpha;
      gl_FragColor = vec4(diffuse + emissive, alpha);
    }
  `,
  transparent: true,
  side: THREE.FrontSide,
});

// Alias so existing refs compile
const coreMaterial = coreShaderMaterial;

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

// (Environment map removed — ShaderMaterial handles lighting in GLSL)

// ============================================
// SCULPTURE PARAMS — lerp + apply to GPU uniforms
// ============================================
function lerpSculptureParams(seasonA, seasonB, t) {
  const a = SCULPT_CONFIG[seasonA];
  const b = SCULPT_CONFIG[seasonB];
  const le = (av, bv) => av + (bv - av) * t;
  return {
    noiseAmp:    le(a.noiseAmp, b.noiseAmp),
    noiseFreq:   le(a.noiseFreq, b.noiseFreq),
    noiseSpeed:  le(a.noiseSpeed, b.noiseSpeed),
    detailAmp:   le(a.detailAmp, b.detailAmp),
    detailFreq:  le(a.detailFreq, b.detailFreq),
    color1:      new THREE.Color().lerpColors(a.color1, b.color1, t),
    color2:      new THREE.Color().lerpColors(a.color2, b.color2, t),
    colorDark:   new THREE.Color().lerpColors(a.colorDark, b.colorDark, t),
    fresnelPow:  le(a.fresnelPow, b.fresnelPow),
    fresnelStr:  le(a.fresnelStr, b.fresnelStr),
    emissiveStr: le(a.emissiveStr, b.emissiveStr),
  };
}

function applySculptureParams(params) {
  const u = coreShaderMaterial.uniforms;
  u.uNoiseAmp.value   = params.noiseAmp;
  u.uNoiseFreq.value  = params.noiseFreq;
  u.uNoiseSpeed.value = params.noiseSpeed;
  u.uDetailAmp.value  = params.detailAmp;
  u.uDetailFreq.value = params.detailFreq;
  u.uColor1.value.copy(params.color1);
  u.uColor2.value.copy(params.color2);
  u.uColorDark.value.copy(params.colorDark);
  u.uFresnelPow.value  = params.fresnelPow;
  u.uFresnelStr.value  = params.fresnelStr;
  u.uEmissiveStr.value = params.emissiveStr;
}

// ============================================
// ANIMATE PARTICLES — season-specific behaviors
// ============================================
function animateParticles(time, seasonConfig) {
  const positions = particleGeometry.attributes.position.array;
  const drift = seasonConfig.particleDrift;
  const season = seasonConfig.name.toLowerCase();
  const spread = seasonConfig.particleSpread;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const speed      = particleSeeds[i * 4];
    const orbitPhase = particleSeeds[i * 4 + 2];
    const floatPhase = particleSeeds[i * 4 + 3];

    const py = positions[i * 3 + 1];

    if (season === 'spring') {
      // Pollen: gentle upward spiral
      const angle = orbitPhase + time * speed * 30;
      positions[i * 3]     += Math.sin(angle) * 0.003 + drift.x;
      positions[i * 3 + 1] += 0.003 + Math.sin(time * 0.3 + floatPhase) * 0.001 + drift.y;
      positions[i * 3 + 2] += Math.cos(angle) * 0.002 + drift.z;
    } else if (season === 'summer') {
      // Sparks: fast erratic bursts
      const angle = orbitPhase + time * speed * 80;
      const burst = Math.sin(time * 3.0 + floatPhase * 7.0) * 0.004;
      positions[i * 3]     += Math.sin(angle) * 0.005 + drift.x + burst;
      positions[i * 3 + 1] += drift.y + Math.cos(time * 2.0 + floatPhase) * 0.003;
      positions[i * 3 + 2] += Math.cos(angle) * 0.005 + drift.z;
    } else if (season === 'autumn') {
      // Leaves: falling + sideways tumble
      const tumble = Math.sin(time * 0.8 + floatPhase * 3.0) * 0.004;
      positions[i * 3]     += tumble + Math.sin(time * 0.5 + orbitPhase) * 0.002 + drift.x;
      positions[i * 3 + 1] += drift.y - 0.002;
      positions[i * 3 + 2] += Math.cos(time * 0.6 + floatPhase) * 0.002 + drift.z;
    } else {
      // Winter: slow drift, occasional gust
      const gust = Math.sin(time * 0.15 + orbitPhase) * 0.0015;
      positions[i * 3]     += gust + drift.x;
      positions[i * 3 + 1] += drift.y - 0.0008;
      positions[i * 3 + 2] += drift.z * 0.5;
    }

    // Boundary check / reset
    const px = positions[i * 3], pz = positions[i * 3 + 2];
    const dist = Math.sqrt(px * px + py * py + pz * pz);
    const fallen = (season === 'autumn' || season === 'winter') && py < -spread * 1.2;

    if (dist > spread * 2.2 || fallen) {
      if (season === 'autumn' || season === 'winter') {
        // Respawn at top
        positions[i * 3]     = (Math.random() - 0.5) * spread * 1.6;
        positions[i * 3 + 1] = spread * (0.9 + Math.random() * 0.5);
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 1.6;
      } else {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = spread * (0.6 + Math.random() * 0.5);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
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
  const season = cfg.name.toLowerCase();
  const scfg = SCULPT_CONFIG[season];
  const u = coreShaderMaterial.uniforms;

  // Animate shader uniforms (GPU blob colors + surface properties)
  gsap.to(u.uColor1.value,    { r: scfg.color1.r, g: scfg.color1.g, b: scfg.color1.b, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(u.uColor2.value,    { r: scfg.color2.r, g: scfg.color2.g, b: scfg.color2.b, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(u.uColorDark.value, { r: scfg.colorDark.r, g: scfg.colorDark.g, b: scfg.colorDark.b, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(u.uFresnelPow,  { value: scfg.fresnelPow,  duration: 1.4, ease: 'power2.inOut' });
  gsap.to(u.uFresnelStr,  { value: scfg.fresnelStr,  duration: 1.4, ease: 'power2.inOut' });
  gsap.to(u.uEmissiveStr, { value: scfg.emissiveStr, duration: 1.4, ease: 'power2.inOut' });
  gsap.to(u.uNoiseAmp,    { value: scfg.noiseAmp,    duration: 1.6, ease: 'power2.inOut' });
  gsap.to(u.uNoiseFreq,   { value: scfg.noiseFreq,   duration: 1.6, ease: 'power2.inOut' });
  gsap.to(u.uNoiseSpeed,  { value: scfg.noiseSpeed,  duration: 1.6, ease: 'power2.inOut' });

  // Scene colors
  gsap.to(glowMaterial.color, { r: cfg.glowColor.r,       g: cfg.glowColor.g,       b: cfg.glowColor.b,       duration: 1.2, ease: 'power2.inOut' });
  gsap.to(pointLight1.color,  { r: cfg.particleColor1.r,  g: cfg.particleColor1.g,  b: cfg.particleColor1.b,  duration: 1.2, ease: 'power2.inOut' });
  gsap.to(pointLight2.color,  { r: cfg.particleColor2.r,  g: cfg.particleColor2.g,  b: cfg.particleColor2.b,  duration: 1.2, ease: 'power2.inOut' });
  gsap.to(ringMaterial.color, { r: cfg.particleColor1.r,  g: cfg.particleColor1.g,  b: cfg.particleColor1.b,  duration: 1,   ease: 'power2.inOut' });
  gsap.to(ring2Material.color,{ r: cfg.particleColor2.r,  g: cfg.particleColor2.g,  b: cfg.particleColor2.b,  duration: 1,   ease: 'power2.inOut' });

  tendrils.forEach(t => {
    gsap.to(t.material.color, { r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b, duration: 1.2, ease: 'power2.inOut' });
  });

  // Glow opacity per season
  const glowOpacity = { spring: 0.08, summer: 0.12, autumn: 0.05, winter: 0.04 };
  gsap.to(glowMaterial, { opacity: glowOpacity[season] ?? 0.08, duration: 1.2 });

  // Particle colors
  const colors = particleGeometry.attributes.color.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const choice = Math.random();
    const col = choice < 0.4 ? cfg.particleColor1 :
                choice < 0.7 ? cfg.particleColor2 : cfg.particleColor3;
    gsap.to(colors, {
      [i * 3]: col.r, [i * 3 + 1]: col.g, [i * 3 + 2]: col.b,
      duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => { particleGeometry.attributes.color.needsUpdate = true; },
    });
  }

  _crossfadeToSeason(season);
  _applyWinterFreeze(season);
  if (audioActive) _startSeasonAmbient(season);
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
  gsap.to(coreShaderMaterial.uniforms.uGlobalAlpha, {
    value: 0.3,
    scrollTrigger: {
      trigger: '.section-statement',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    }
  });

  // Bring back for epochs
  gsap.to(coreShaderMaterial.uniforms.uGlobalAlpha, {
    value: 1.0,
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
// MOUSE TRACKING + BLOB RIPPLE
// ============================================
function onMouseMove(e) {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

  // Ripple: raycast against blob to get hit point
  ripplePointer.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  blobRaycaster.setFromCamera(ripplePointer, camera);
  const hits = blobRaycaster.intersectObject(coreMesh);
  if (hits.length > 0) {
    coreShaderMaterial.uniforms.uRipplePos.value.copy(hits[0].point);
    coreShaderMaterial.uniforms.uRippleAge.value = 0;
  }
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

  // GPU shader time + ripple age
  coreShaderMaterial.uniforms.uTime.value = time;
  coreShaderMaterial.uniforms.uRippleAge.value += 0.018;

  // Lerp signed speed toward target — passes through zero so direction never snaps
  const targetSpeed = cfg.rotationSpeed * rotationDir;
  signedRotSpeed += (targetSpeed - signedRotSpeed) * 0.04;
  coreMesh.rotation.y += signedRotSpeed;

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
  ring2.rotation.z += 0.0008;
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
// SCROLL-DRIVEN SEASONS ENGINE
// ============================================
function initScrollDrivenSeasons() {
  [
    { id: 'sectionSummer', enter: 'summer', back: 'spring' },
    { id: 'sectionAutumn', enter: 'autumn', back: 'summer' },
    { id: 'sectionWinter', enter: 'winter', back: 'autumn' },
  ].forEach(({ id, enter, back }) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top 55%',
      onEnter:     () => _triggerSeasonChange(enter),
      onLeaveBack: () => _triggerSeasonChange(back),
    });
  });
}

function _triggerSeasonChange(season) {
  const newIndex = SEASONS.indexOf(season);
  if (newIndex === currentSeasonIndex) return;
  rotationDir = newIndex > currentSeasonIndex ? 1 : -1;
  currentSeasonIndex = newIndex;
  const cfg = SEASON_CONFIG[season];
  document.body.dataset.season = season;
  updateSeasonUI(season, cfg);
  _animateSculptureToSeason(season);
  _updateSceneColors(cfg);
  _updateParticleColors(cfg);
  _crossfadeToSeason(season);
  if (audioActive) _startSeasonAmbient(season);
}

// ============================================
// FREEZE SOUND — procedural ice crackle SFX
// ============================================
const _freezingAudio = new Audio('/freezing.mp3');
_freezingAudio.preload      = 'auto';
_freezingAudio.volume       = 0.35;
_freezingAudio.playbackRate = 0.7;

function _playFreezeSound() {
  if (!audioActive) return;
  _freezingAudio.currentTime = 0;
  _freezingAudio.play().catch(() => {});
}

function _applyWinterFreeze(season) {
  const u = coreShaderMaterial.uniforms;
  gsap.killTweensOf(u.uFreezeProgress);
  if (season === 'winter') {
    u.uFreezeProgress.value = 0;
    _playFreezeSound();
    gsap.to(u.uFreezeProgress, {
      value: 1.0,
      duration: 5.5,
      delay: 0.5,
      ease: 'power2.in',
    });
  } else {
    u.uFreezeProgress.value = 0;
  }
}

function _animateSculptureToSeason(season) {
  const scfg = SCULPT_CONFIG[season];
  const u    = coreShaderMaterial.uniforms;
  const TRANS = {
    spring: { dur: 1.6, ease: 'power3.inOut' },
    summer: { dur: 0.85, ease: 'power4.out' },
    autumn: { dur: 2.0,  ease: 'power2.inOut' },
    winter: { dur: 4.0,  ease: 'power1.inOut' },
  };
  const { dur, ease } = TRANS[season];

  gsap.to(u.uNoiseAmp,        { value: scfg.noiseAmp,    duration: dur,        ease });
  gsap.to(u.uNoiseFreq,       { value: scfg.noiseFreq,   duration: dur,        ease });
  gsap.to(u.uNoiseSpeed,      { value: scfg.noiseSpeed,  duration: dur * 0.3,  ease: 'power3.out' });
  gsap.to(u.uDetailAmp,       { value: scfg.detailAmp,   duration: dur * 0.8,  ease });
  gsap.to(u.uDetailFreq,      { value: scfg.detailFreq,  duration: dur * 0.8,  ease });
  gsap.to(u.uColor1.value,    { r: scfg.color1.r,    g: scfg.color1.g,    b: scfg.color1.b,    duration: dur * 0.85, ease });
  gsap.to(u.uColor2.value,    { r: scfg.color2.r,    g: scfg.color2.g,    b: scfg.color2.b,    duration: dur * 0.85, ease });
  gsap.to(u.uColorDark.value, { r: scfg.colorDark.r, g: scfg.colorDark.g, b: scfg.colorDark.b, duration: dur * 0.85, ease });
  gsap.to(u.uFresnelPow,      { value: scfg.fresnelPow,  duration: dur * 1.1,  ease });
  gsap.to(u.uFresnelStr,      { value: scfg.fresnelStr,  duration: dur * 1.1,  ease });
  gsap.to(u.uEmissiveStr,     { value: scfg.emissiveStr, duration: dur * 0.75, ease });
  _applyWinterFreeze(season);
}

function _updateParticleColors(cfg) {
  const colors = particleGeometry.attributes.color.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const c = Math.random();
    const col = c < 0.4 ? cfg.particleColor1 : c < 0.7 ? cfg.particleColor2 : cfg.particleColor3;
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  particleGeometry.attributes.color.needsUpdate = true;
}

function _updateSceneColors(cfg) {
  gsap.to(glowMaterial.color,  { r: cfg.glowColor.r,      g: cfg.glowColor.g,      b: cfg.glowColor.b,      duration: 0.9 });
  gsap.to(pointLight1.color,   { r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b, duration: 0.9 });
  gsap.to(pointLight2.color,   { r: cfg.particleColor2.r, g: cfg.particleColor2.g, b: cfg.particleColor2.b, duration: 0.9 });
  gsap.to(ringMaterial.color,  { r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b, duration: 0.8 });
  gsap.to(ring2Material.color, { r: cfg.particleColor2.r, g: cfg.particleColor2.g, b: cfg.particleColor2.b, duration: 0.8 });
  tendrils.forEach(t => gsap.to(t.material.color, { r: cfg.particleColor1.r, g: cfg.particleColor1.g, b: cfg.particleColor1.b, duration: 0.9 }));
}

// ============================================
// WEB AUDIO — ambient season soundscapes
// ============================================
let audioCtx = null;
let audioNodes = {};
let audioActive = false;

function initAudio() {
  const btn = document.getElementById('audioBtn');
  if (!btn) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  _buildSeasonAudio();

  btn.addEventListener('click', () => {
    audioActive = !audioActive;
    btn.classList.toggle('active', audioActive);

    if (audioActive) {
      audioCtx.resume().then(() => {
        _startSeasonAmbient(SEASONS[currentSeasonIndex]);
        _crossfadeToSeason(SEASONS[currentSeasonIndex]);
      });
    } else {
      audioCtx.suspend();
      _freezingAudio.pause();
      _freezingAudio.currentTime = 0;
      _springAmbient.silence();
      _summerAudio.pause();
      _autumnAudio.pause();
    }
  });
}

function _startSeasonAmbient(season) {
  if (season === 'winter')      { _winterAmbient.start(); _autumnAmbient.stop(); _springAmbient.stop(); _summerAmbient.stop(); }
  else if (season === 'autumn') { _autumnAmbient.start(); _winterAmbient.stop(); _springAmbient.stop(); _summerAmbient.stop(); }
  else if (season === 'spring') { _springAmbient.start(); _winterAmbient.stop(); _autumnAmbient.stop(); _summerAmbient.stop(); }
  else if (season === 'summer') { _summerAmbient.start(); _winterAmbient.stop(); _autumnAmbient.stop(); _springAmbient.stop(); }
  else                          { _winterAmbient.stop();  _autumnAmbient.stop(); _springAmbient.stop(); _summerAmbient.stop(); }
}

function _buildSeasonAudio() {
  // Only build pink noise for winter — it's the only season that uses it.
  // Building nodes for other seasons and leaving them at gain 0 causes audible bleed.
  const bufSize = audioCtx.sampleRate * 4;
  const buf     = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data    = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }

  const src  = audioCtx.createBufferSource();
  src.buffer = buf;
  src.loop   = true;

  const filt = audioCtx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 180; filt.Q.value = 1.4;

  const gain = audioCtx.createGain();
  gain.gain.value = 0;

  src.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
  src.start();
  audioNodes['winter'] = { src, filt, gainNode: gain };
}

function _crossfadeToSeason(season) {
  if (!audioCtx || !audioActive) return;
  const node = audioNodes['winter'];
  if (!node) return;
  // Fade winter noise in for winter (and sections below it), off for everything above
  const target = season === 'winter' ? 0.08 : 0;
  node.gainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.8);
}

// ============================================
// SPRING AMBIENT — spring.mp3 via HTMLAudioElement
// Strategy: start muted immediately (always allowed), unmute on first mousemove.
// Unmuting a playing audio element needs NO user gesture — only the initial play() does.
// ============================================
const _springAudio = new Audio('/summer.mp3');
_springAudio.loop   = true;
_springAudio.volume = 0.75;

const _springAmbient = (() => {
  let masterGain = null;
  let chimeTimer = null;

  function _ensureGain() {
    if (masterGain) return;
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(audioCtx.destination);
  }

  function _ping(freq, delay, vol) {
    if (!audioCtx || !masterGain) return;
    const now  = audioCtx.currentTime;
    const osc  = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = freq;
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = freq * 2;
    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0, now + delay);
    env.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + delay + 4.5);
    const env2 = audioCtx.createGain();
    env2.gain.setValueAtTime(0, now + delay);
    env2.gain.linearRampToValueAtTime(vol * 0.15, now + delay + 0.01);
    env2.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.0);
    osc.connect(env);   env.connect(masterGain);
    osc2.connect(env2); env2.connect(masterGain);
    osc.start(now + delay);  osc.stop(now + delay + 5.0);
    osc2.start(now + delay); osc2.stop(now + delay + 2.5);
  }

  function _chime() {
    if (!audioCtx || !audioActive || !masterGain) return;
    const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3];
    const r = Math.random();
    if (r < 0.35) {
      _ping(SCALE[Math.floor(Math.random() * SCALE.length)], 0, 0.055);
    } else if (r < 0.70) {
      const i = Math.floor(Math.random() * (SCALE.length - 1));
      _ping(SCALE[i], 0, 0.052);
      _ping(SCALE[i + 1], 0.6 + Math.random() * 0.5, 0.040);
    } else {
      const i = Math.floor(Math.random() * (SCALE.length - 2));
      _ping(SCALE[i], 0, 0.048);
      _ping(SCALE[i + 1], 0.55 + Math.random() * 0.3, 0.038);
      _ping(SCALE[i + 2], 1.2  + Math.random() * 0.4, 0.030);
    }
  }

  function _scheduleChimes() {
    if (!audioActive) return;
    _chime();
    chimeTimer = setTimeout(_scheduleChimes, 2500 + Math.random() * 4500);
  }

  return {
    start() {
      if (!audioActive) return;
      _ensureGain();
      _springAudio.muted = false;
      if (_springAudio.paused) _springAudio.play().catch(() => {});
      if (!chimeTimer) _scheduleChimes();
    },
    stop() {
      _springAudio.muted = true;
      if (chimeTimer) { clearTimeout(chimeTimer); chimeTimer = null; }
    },
    silence() {
      _springAudio.muted = true;
      _springAudio.pause();
      if (chimeTimer) { clearTimeout(chimeTimer); chimeTimer = null; }
    },
  };
})();

// ============================================
// WINTER AMBIENT — light atmospheric layer
// ============================================
const _winterAmbient = (() => {
  let masterGain = null;
  let built      = false;

  function _build() {
    if (!audioCtx || built) return;
    built = true;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    // Slow master breath — the whole pad inhales/exhales gently
    const breathLFO = audioCtx.createOscillator();
    breathLFO.frequency.value = 0.07; // one breath every ~14s
    const breathAmt = audioCtx.createGain();
    breathAmt.gain.value = 0.18;
    breathLFO.connect(breathAmt);
    breathAmt.connect(masterGain.gain);
    breathLFO.start();

    // Soft pad: detuned sine pairs on an Am chord (A–C–E–A)
    // Each note has two slightly-detuned oscillators → warm chorus without noise
    // [freq1, freq2, gain]
    [
      [110.0, 110.7, 0.048],  // A2
      [130.8, 131.4, 0.032],  // C3  (minor third — gives wintery melancholy)
      [164.8, 165.5, 0.028],  // E3
      [220.0, 221.0, 0.022],  // A3
      [261.6, 262.4, 0.014],  // C4
      [330.0, 331.0, 0.010],  // E4  (very soft upper layer)
    ].forEach(([f1, f2, gain]) => {
      [f1, f2].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        // Each voice has its own very-slow vibrato so they drift independently
        const vib = audioCtx.createOscillator();
        vib.frequency.value = 0.09 + i * 0.04;
        const vibAmt = audioCtx.createGain();
        vibAmt.gain.value = 0.35;
        vib.connect(vibAmt); vibAmt.connect(osc.frequency);
        vib.start();
        const g = audioCtx.createGain();
        g.gain.value = gain;
        osc.connect(g); g.connect(masterGain);
        osc.start();
      });
    });
  }

  return {
    start() {
      if (!audioCtx || !audioActive) return;
      _build();
      if (!masterGain) return;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 3.0);
    },
    stop() {
      if (!masterGain) return;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 2.5);
    },
  };
})();

// ============================================
// SUMMER AMBIENT — spring.mp3 (forest/birds) on loop
// ============================================
const _summerAudio = new Audio('/spring.mp3');
_summerAudio.loop   = true;
_summerAudio.volume = 0.35;

const _summerAmbient = {
  start() {
    if (!audioActive) return;
    _summerAudio.play().catch(() => {});
  },
  stop() {
    _summerAudio.pause();
  },
};

// ============================================
// AUTUMN AMBIENT — autumn.mp3 + warm Dm pad + falling-leaf plucks
// ============================================
const _autumnAudio = new Audio('/autumn.mp3');
_autumnAudio.loop   = true;
_autumnAudio.volume = 0.5;
const _autumnAmbient = (() => {
  let masterGain  = null;
  let built       = false;
  let pluckTimer  = null;

  function _build() {
    if (!audioCtx || built) return;
    built = true;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    // Slow sway LFO — like leaves drifting on the breeze
    const swayLFO = audioCtx.createOscillator();
    swayLFO.frequency.value = 0.05; // very slow
    const swayAmt = audioCtx.createGain();
    swayAmt.gain.value = 0.12;
    swayLFO.connect(swayAmt);
    swayAmt.connect(masterGain.gain);
    swayLFO.start();

    // Dm pad (D–F–A): detuned sine pairs, warm and earthy
    // [freq1, freq2, gain]
    [
      [146.8, 147.5, 0.042],  // D3
      [174.6, 175.3, 0.030],  // F3  (minor third)
      [220.0, 221.0, 0.026],  // A3
      [293.7, 294.5, 0.018],  // D4
      [349.2, 350.0, 0.012],  // F4
      [440.0, 441.2, 0.008],  // A4 (faint shimmer)
    ].forEach(([f1, f2, gain]) => {
      [f1, f2].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const vib = audioCtx.createOscillator();
        vib.frequency.value = 0.08 + i * 0.035;
        const vibAmt = audioCtx.createGain();
        vibAmt.gain.value = 0.3;
        vib.connect(vibAmt); vibAmt.connect(osc.frequency);
        vib.start();
        const g = audioCtx.createGain();
        g.gain.value = gain;
        osc.connect(g); g.connect(masterGain);
        osc.start();
      });
    });
  }

  // Single falling-leaf pluck: short decaying sine at a pentatonic pitch
  function _pluck() {
    if (!audioCtx || !audioActive || !masterGain) return;
    // D pentatonic minor: D3 E3 F3 A3 C4 D4 F4 A4
    const FREQS = [146.8, 164.8, 174.6, 220.0, 261.6, 293.7, 349.2, 440.0];
    const freq  = FREQS[Math.floor(Math.random() * FREQS.length)];
    const now   = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.055, now + 0.008);  // fast attack
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.6); // gentle decay

    osc.connect(env); env.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.7);
  }

  function _schedulePlucks() {
    if (!audioActive) return;
    _pluck();
    // Next pluck in 1.8 – 5.5 seconds (irregular, like leaves falling)
    const delay = 1800 + Math.random() * 3700;
    pluckTimer = setTimeout(_schedulePlucks, delay);
  }

  return {
    start() {
      if (!audioCtx || !audioActive) return;
      _build();
      if (!masterGain) return;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 2.5);
      if (!pluckTimer) _schedulePlucks();
      _autumnAudio.play().catch(() => {});
    },
    stop() {
      if (!masterGain) return;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 2.0);
      if (pluckTimer) { clearTimeout(pluckTimer); pluckTimer = null; }
      _autumnAudio.pause();
    },
  };
})();

// ============================================
// SEASON MOMENT ENTRANCE ANIMATIONS
// ============================================
function initSeasonMoments() {
  document.querySelectorAll('.section-season-moment').forEach(section => {
    const lines  = section.querySelectorAll('.moment-line');
    const body   = section.querySelector('.moment-body');
    const data   = section.querySelector('.moment-data');
    const glyph  = section.querySelector('.moment-glyph');
    const eyebrow = section.querySelector('.moment-eyebrow');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 12, duration: 0.6, ease: 'power3.out' }, 0);
        tl.from(lines, { opacity: 0, y: 60, duration: 1.1, stagger: 0.1, ease: 'power4.out' }, 0.1);
        if (body) tl.from(body, { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out' }, 0.5);
        if (data) tl.from(data, { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' }, 0.7);
        if (glyph) tl.from(glyph, { opacity: 0, scale: 0.88, duration: 2.0, ease: 'power2.out' }, 0);
      },
    });
  });
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
  initScrollDrivenSeasons();
  initEpochCards();
  initEpochVisuals();
  initStmtRing();
  initStmtCard();
  initStmtText();
  initCursor();
  initAudio();
  initSeasonMoments();

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
