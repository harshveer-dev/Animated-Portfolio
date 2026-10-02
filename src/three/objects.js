/**
 * 3D Objects and Environment Generation for Harshveer Singh's Portfolio
 * Crafted with Three.js geometry, custom procedural shaders & materials
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { cinematicConfig } from '../config/cinematicConfig.js';

export function create4DTesseract() {
  const tesseractGroup = new THREE.Group();

  // 16 4-dimensional vertices (+-1, +-1, +-1, +-1)
  const vertices4D = [];
  for (let i = 0; i < 16; i++) {
    vertices4D.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }

  // 32 4-dimensional edges (connecting vertices differing by exactly 1 bit)
  const edges4D = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if ((diff & (diff - 1)) === 0) {
        edges4D.push([i, j]);
      }
    }
  }

  // Edge line geometry (32 edges * 2 endpoints * 3 floats = 192 floats)
  const edgePositions = new Float32Array(32 * 2 * 3);
  const edgeColors = new Float32Array(32 * 2 * 3);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));

  const edgeMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    linewidth: 2
  });

  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  tesseractGroup.add(edgeLines);

  // 16 Glowing Vertex Spheres
  const vertexSpheres = [];
  const sphereGeo = new THREE.SphereGeometry(0.11, 16, 16);
  for (let i = 0; i < 16; i++) {
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    tesseractGroup.add(sphere);
    vertexSpheres.push(sphere);
  }

  // 4D Core Hyperspace Ring
  const coreHaloGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
  const coreHaloMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const coreHalo = new THREE.Mesh(coreHaloGeo, coreHaloMat);
  tesseractGroup.add(coreHalo);

  // Method to project 4D -> 3D and update animation
  function update4D(time, scrollProgress, speedMult = 1.0) {
    const angleXW = time * 0.45 * speedMult + scrollProgress * 4.0;
    const angleYW = time * 0.35 * speedMult + scrollProgress * 3.0;
    const angleZW = time * 0.25 * speedMult;
    const angleXY = time * 0.2;

    const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW);
    const cosYW = Math.cos(angleYW), sinYW = Math.sin(angleYW);
    const cosZW = Math.cos(angleZW), sinZW = Math.sin(angleZW);
    const cosXY = Math.cos(angleXY), sinXY = Math.sin(angleXY);

    // Projected 3D positions array
    const projected3D = [];
    const wValues = [];

    const d = 2.4; // 4D perspective distance
    const scale = 2.3;

    for (let i = 0; i < 16; i++) {
      let [x, y, z, w] = vertices4D[i];

      // 4D Rotation in XW plane
      let x1 = x * cosXW - w * sinXW;
      let w1 = x * sinXW + w * cosXW;

      // 4D Rotation in YW plane
      let y2 = y * cosYW - w1 * sinYW;
      let w2 = y * sinYW + w1 * cosYW;

      // 4D Rotation in ZW plane
      let z3 = z * cosZW - w2 * sinZW;
      let w3 = z * sinZW + w2 * cosZW;

      // Subtle 3D rotation in XY plane
      let x4 = x1 * cosXY - y2 * sinXY;
      let y4 = x1 * sinXY + y2 * cosXY;

      // 4D -> 3D Stereographic perspective projection
      const projection = 1 / (d - w3 * 0.55);
      const px = x4 * projection * scale;
      const py = y4 * projection * scale;
      const pz = z3 * projection * scale;

      projected3D.push({ x: px, y: py, z: pz });
      wValues.push(w3);

      // Update Vertex Sphere position and 4D color modulation
      const sphere = vertexSpheres[i];
      sphere.position.set(px, py, pz);
      const sphereScale = Math.max(0.6, Math.min(1.8, projection * 1.2));
      sphere.scale.set(sphereScale, sphereScale, sphereScale);

      // Color shifts based on w coordinate: cyan when w > 0, purple/lavender when w < 0
      const normW = (w3 + 1.4) / 2.8;
      sphere.material.color.setRGB(
        0.2 + normW * 0.6,
        0.5 + (1 - normW) * 0.4,
        0.95
      );
      sphere.material.emissive.setRGB(
        0.1 + normW * 0.5,
        0.3 + (1 - normW) * 0.3,
        0.8
      );
    }

    // Update 32 Edges in BufferGeometry
    const posAttr = edgeGeo.attributes.position;
    const colAttr = edgeGeo.attributes.color;
    let ptr = 0;

    for (let e = 0; e < 32; e++) {
      const [iA, iB] = edges4D[e];
      const pA = projected3D[iA];
      const pB = projected3D[iB];
      const wA = wValues[iA];
      const wB = wValues[iB];

      posAttr.array[ptr] = pA.x;
      posAttr.array[ptr + 1] = pA.y;
      posAttr.array[ptr + 2] = pA.z;

      colAttr.array[ptr] = 0.22 + ((wA + 1) / 2) * 0.5;
      colAttr.array[ptr + 1] = 0.74;
      colAttr.array[ptr + 2] = 0.98;

      posAttr.array[ptr + 3] = pB.x;
      posAttr.array[ptr + 4] = pB.y;
      posAttr.array[ptr + 5] = pB.z;

      colAttr.array[ptr + 3] = 0.75 + ((wB + 1) / 2) * 0.2;
      colAttr.array[ptr + 4] = 0.52;
      colAttr.array[ptr + 5] = 0.99;

      ptr += 6;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Halo rotation
    coreHalo.rotation.x = time * 0.3;
    coreHalo.rotation.y = time * 0.5;

    return {
      wMean: (wValues[0] || 0).toFixed(2),
      rotationAngle: ((angleXW * 180 / Math.PI) % 360).toFixed(0)
    };
  }

  return {
    group: tesseractGroup,
    update4D
  };
}

export function createCinematicEnvironment() {
  const group = new THREE.Group();

  // 1. Starfield / Deep Space Dust Particles (Driven by cinematicConfig)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile && cinematicConfig.mobile.reduceParticles
    ? cinematicConfig.mobile.mobileParticleCount
    : cinematicConfig.particles.density;

  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Spread along deep Z corridor
    particlePos[i * 3] = (Math.random() - 0.5) * 50;
    particlePos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    particlePos[i * 3 + 2] = -Math.random() * 120 + 20;

    // Palette: Cool Cyan (#38bdf8), Soft Lavender (#c084fc), Electric Indigo (#818cf8)
    const pType = Math.random();
    if (pType < 0.4) {
      particleColors[i * 3] = 0.22;
      particleColors[i * 3 + 1] = 0.74;
      particleColors[i * 3 + 2] = 0.97;
    } else if (pType < 0.75) {
      particleColors[i * 3] = 0.51;
      particleColors[i * 3 + 1] = 0.55;
      particleColors[i * 3 + 2] = 0.97;
    } else {
      particleColors[i * 3] = 0.75;
      particleColors[i * 3 + 1] = 0.52;
      particleColors[i * 3 + 2] = 0.99;
    }
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: cinematicConfig.particles.size,
    vertexColors: true,
    transparent: true,
    opacity: cinematicConfig.particles.opacity,
    blending: THREE.AdditiveBlending
  });

  const starField = new THREE.Points(particleGeo, particleMat);
  group.add(starField);

  // 2. PEACEFUL & CINEMATIC CELESTIAL HORIZON (HERO SCENE)
  const heroGroup = new THREE.Group();
  heroGroup.position.set(0, -0.4, 0);

  // Smooth, tranquil Celestial Orb
  const orbGeo = new THREE.SphereGeometry(2.2, 64, 64);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x111633,
    emissive: 0x1e1b4b,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
    opacity: 0.95
  });
  const celestialOrb = new THREE.Mesh(orbGeo, orbMat);
  heroGroup.add(celestialOrb);

  // Soft Outer Atmospheric Glow Halo
  const haloGeo = new THREE.SphereGeometry(2.38, 48, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const atmosphereHalo = new THREE.Mesh(haloGeo, haloMat);
  heroGroup.add(atmosphereHalo);

  // Gentle, Serene Horizon Light Arc
  const arcGeo = new THREE.RingGeometry(2.4, 2.58, 64);
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const peacefulRing1 = new THREE.Mesh(arcGeo, arcMat);
  peacefulRing1.rotation.x = Math.PI * 0.42;
  heroGroup.add(peacefulRing1);

  // Second soft lavender ambient orbit
  const arcGeo2 = new THREE.RingGeometry(3.1, 3.16, 64);
  const arcMat2 = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const peacefulRing2 = new THREE.Mesh(arcGeo2, arcMat2);
  peacefulRing2.rotation.x = Math.PI * 0.35;
  peacefulRing2.rotation.y = Math.PI * 0.15;
  heroGroup.add(peacefulRing2);

  group.add(heroGroup);

  // 3. ABOUT SCENE OBJECT: 3D Developer Workspace (Laptop + Database Cylinder + Git Graph)
  const aboutGroup = new THREE.Group();
  aboutGroup.position.set(2.5, 0, -22);

  // Stylized Laptop
  const laptopGroup = new THREE.Group();
  // Laptop Base
  const baseGeo = new THREE.BoxGeometry(3.2, 0.15, 2.2);
  const laptopMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3
  });
  const laptopBase = new THREE.Mesh(baseGeo, laptopMat);
  laptopGroup.add(laptopBase);

  // Laptop Screen
  const screenBezelGeo = new THREE.BoxGeometry(3.2, 2.2, 0.1);
  const screenBezel = new THREE.Mesh(screenBezelGeo, laptopMat);
  screenBezel.position.set(0, 1.1, -1.05);
  screenBezel.rotation.x = -Math.PI * 0.12;

  // Glowing code display on laptop screen
  const screenDisplayGeo = new THREE.PlaneGeometry(2.9, 1.9);
  const screenDisplayMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    side: THREE.DoubleSide
  });
  const screenDisplay = new THREE.Mesh(screenDisplayGeo, screenDisplayMat);
  screenDisplay.position.set(0, 0, 0.06);
  screenBezel.add(screenDisplay);

  // Python logo / Glowing accent line on screen
  const glowLineGeo = new THREE.PlaneGeometry(2.2, 0.15);
  const glowLineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const glowLine = new THREE.Mesh(glowLineGeo, glowLineMat);
  glowLine.position.set(0, 0.4, 0.07);
  screenBezel.add(glowLine);

  laptopGroup.add(screenBezel);
  laptopGroup.scale.set(0.9, 0.9, 0.9);
  laptopGroup.rotation.y = -Math.PI * 0.18;
  laptopGroup.rotation.x = 0.1;
  aboutGroup.add(laptopGroup);

  // Database Cylinder (MySQL Visualization)
  const dbGroup = new THREE.Group();
  dbGroup.position.set(2.8, -0.6, -1.0);
  for (let d = 0; d < 3; d++) {
    const discGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x312e81,
      roughness: 0.3,
      metalness: 0.8
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = d * 0.48;

    // Glowing rim
    const rimGeo = new THREE.TorusGeometry(0.86, 0.03, 16, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = d * 0.48;
    dbGroup.add(disc);
    dbGroup.add(rim);
  }
  aboutGroup.add(dbGroup);

  // Git Branch Network (Floating connecting spheres & lines)
  const gitGroup = new THREE.Group();
  gitGroup.position.set(-2.6, 1.2, -0.5);
  const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const n1 = new THREE.Mesh(nodeGeo, nodeMat);
  const n2 = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xc084fc }));
  const n3 = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0x34d399 }));
  n1.position.set(-0.8, -0.6, 0);
  n2.position.set(0.2, 0.2, 0.2);
  n3.position.set(0.9, -0.3, -0.1);
  gitGroup.add(n1, n2, n3);

  // Branch lines
  const linePoints = [
    n1.position,
    n2.position,
    n3.position
  ];
  const gitLineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const gitLineMat = new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 });
  const gitLine = new THREE.Line(gitLineGeo, gitLineMat);
  gitGroup.add(gitLine);

  aboutGroup.add(gitGroup);
  group.add(aboutGroup);

  // 4. JOURNEY SCENE: Waypoint Pathway
  const journeyGroup = new THREE.Group();
  journeyGroup.position.set(0, 0, -48);
  const pathWayCount = 10;
  const pathWayMarkers = [];

  for (let i = 0; i < pathWayCount; i++) {
    const markerGroup = new THREE.Group();
    const side = (i % 2 === 0 ? 1 : -1) * (2.8 + (i % 3) * 0.4);
    const zOffset = -i * 2.8;

    markerGroup.position.set(side, (Math.random() - 0.5) * 1.5, zOffset);

    // Glowing milestone beacon
    const beaconGeo = new THREE.OctahedronGeometry(0.5, 0);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: i === 9 ? 0xf43f5e : 0x38bdf8,
      emissive: i === 9 ? 0x881337 : 0x0284c7,
      roughness: 0.1,
      metalness: 0.9
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    markerGroup.add(beacon);

    // Aura ring
    const auraGeo = new THREE.RingGeometry(0.7, 0.76, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = Math.PI / 2;
    markerGroup.add(aura);

    journeyGroup.add(markerGroup);
    pathWayMarkers.push(markerGroup);
  }
  group.add(journeyGroup);

  // 5. SKILLS UNIVERSE: Central Core with Orbiting Skill Spheres
  const skillsGroup = new THREE.Group();
  skillsGroup.position.set(0, 0, -78);

  // Central Sun/Core
  const skillSunGeo = new THREE.SphereGeometry(1.6, 32, 32);
  const skillSunMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x1e3a8a,
    roughness: 0.2,
    metalness: 0.7
  });
  const skillSun = new THREE.Mesh(skillSunGeo, skillSunMat);
  skillsGroup.add(skillSun);

  // Orbit Rings
  const orbitRadii = [3.4, 4.4, 5.4, 6.4];
  const orbitRingMeshes = [];
  orbitRadii.forEach(r => {
    const oGeo = new THREE.RingGeometry(r, r + 0.04, 64);
    const oMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const oRing = new THREE.Mesh(oGeo, oMat);
    oRing.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
    skillsGroup.add(oRing);
    orbitRingMeshes.push(oRing);
  });

  // Floating Skill Nodes (11 skills)
  const skillNodeMeshes = [];
  const skillColors = [
    0x38bdf8, 0x818cf8, 0x34d399, 0xfb923c, 0xe2e8f0,
    0xf87171, 0x60a5fa, 0xfacc15, 0xc084fc, 0xf472b6, 0x2dd4bf
  ];

  for (let s = 0; s < 11; s++) {
    const nodeG = new THREE.Group();
    const radius = 3.2 + (s % 4) * 0.9;
    const baseAngle = (s / 11) * Math.PI * 2;

    const sGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const sMat = new THREE.MeshStandardMaterial({
      color: skillColors[s],
      emissive: skillColors[s],
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const sMesh = new THREE.Mesh(sGeo, sMat);
    nodeG.add(sMesh);

    // Mini orbit halo
    const sHaloGeo = new THREE.RingGeometry(0.48, 0.54, 24);
    const sHaloMat = new THREE.MeshBasicMaterial({
      color: skillColors[s],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const sHalo = new THREE.Mesh(sHaloGeo, sHaloMat);
    nodeG.add(sHalo);

    nodeG.userData = {
      radius: radius,
      angle: baseAngle,
      speed: 0.005 + (s % 3) * 0.003,
      index: s
    };

    skillsGroup.add(nodeG);
    skillNodeMeshes.push(nodeG);
  }
  group.add(skillsGroup);

  // 6. PROJECTS SCENE: Holographic Platforms
  const projectsGroup = new THREE.Group();
  projectsGroup.position.set(0, 0, -112);

  // Hologram emitter disc
  const holoDiscGeo = new THREE.CylinderGeometry(5.5, 6.0, 0.3, 48);
  const holoDiscMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x1e1b4b,
    metalness: 0.8,
    roughness: 0.2
  });
  const holoDisc = new THREE.Mesh(holoDiscGeo, holoDiscMat);
  holoDisc.position.y = -3;
  projectsGroup.add(holoDisc);

  // Hologram beam rings
  for (let b = 0; b < 4; b++) {
    const bRingGeo = new THREE.RingGeometry(2 + b * 1.0, 2.05 + b * 1.0, 48);
    const bRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25 - b * 0.05
    });
    const bRing = new THREE.Mesh(bRingGeo, bRingMat);
    bRing.rotation.x = Math.PI / 2;
    bRing.position.y = -2.8 + b * 0.6;
    projectsGroup.add(bRing);
  }

  // Floating futuristic frames representing project windows
  const projFrames = [];
  [-3.8, 0, 3.8].forEach((posX, idx) => {
    const frameG = new THREE.Group();
    frameG.position.set(posX, 0.4 + (idx % 2) * 0.5, -idx * 1.5);

    const fGeo = new THREE.BoxGeometry(2.8, 1.8, 0.08);
    const fMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8
    });
    const fMesh = new THREE.Mesh(fGeo, fMat);

    // Glowing border outline
    const borderGeo = new THREE.EdgesGeometry(fGeo);
    const borderMat = new THREE.LineBasicMaterial({
      color: idx === 1 ? 0x38bdf8 : 0x818cf8,
      linewidth: 2
    });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    fMesh.add(border);

    frameG.add(fMesh);
    projectsGroup.add(frameG);
    projFrames.push(frameG);
  });
  group.add(projectsGroup);

  // 7. CODE & EDUCATION SCENE: Monolith & Floating Matrix
  const codeEduGroup = new THREE.Group();
  codeEduGroup.position.set(0, 0, -145);

  // Monolith column
  const monoGeo = new THREE.BoxGeometry(2.4, 7.5, 0.8);
  const monoMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x1e293b,
    roughness: 0.1,
    metalness: 0.9
  });
  const monolith = new THREE.Mesh(monoGeo, monoMat);
  codeEduGroup.add(monolith);

  // Orbiting code runes / fragments
  const runeGroup = new THREE.Group();
  for (let r = 0; r < 24; r++) {
    const rGeo = new THREE.BoxGeometry(0.35, 0.08, 0.08);
    const rMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    const a = (r / 24) * Math.PI * 2;
    rMesh.position.set(Math.cos(a) * 2.2, (r / 24) * 6 - 3, Math.sin(a) * 2.2);
    runeGroup.add(rMesh);
  }
  codeEduGroup.add(runeGroup);
  group.add(codeEduGroup);

  // 8. CONTACT & FUTURE SCENE: Portal Gate of Tomorrow
  const contactGroup = new THREE.Group();
  contactGroup.position.set(0, 0, -180);

  // Arch Portal
  const archGeo = new THREE.TorusGeometry(4.5, 0.35, 32, 64, Math.PI);
  const archMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x1e3a8a,
    metalness: 0.9,
    roughness: 0.1
  });
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.rotation.z = Math.PI;
  contactGroup.add(arch);

  // Portal horizon floor
  const floorGrid = new THREE.GridHelper(30, 30, 0x38bdf8, 0x1e293b);
  floorGrid.position.y = -3.2;
  contactGroup.add(floorGrid);

  group.add(contactGroup);

  return {
    group,
    heroGroup,
    celestialOrb,
    atmosphereHalo,
    peacefulRing1,
    peacefulRing2,
    aboutGroup,
    laptopGroup,
    dbGroup,
    gitGroup,
    journeyGroup,
    pathWayMarkers,
    skillsGroup,
    skillSun,
    skillNodeMeshes,
    projectsGroup,
    projFrames,
    codeEduGroup,
    monolith,
    runeGroup,
    contactGroup,
    starField
  };
}
