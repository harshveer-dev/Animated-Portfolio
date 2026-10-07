/**
 * Three.js Scene Manager & Cinematic Camera Rig
 * Manages WebGL context, cinematic lighting, camera travel, and render loop
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createCinematicEnvironment } from './objects.js';
import { cinematicConfig } from '../config/cinematicConfig.js';

export class CinematicSceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.config = cinematicConfig;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = null;

    // Camera waypoint targets mapped to scroll progress [0.0 - 1.0]
    this.scrollProgress = 0;
    this.targetCameraZ = 7;
    this.targetCameraX = 0;
    this.targetCameraY = 0;
    this.targetLookZ = 0;

    // Mouse parallax tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isWebGLSupported = true;
    this.clock = new THREE.Clock();

    this.init();
  }

  applyLiveConfig(key, value) {
    if (key === 'animationSpeed') this.config.motion.animationSpeed = parseFloat(value);
    if (key === 'parallaxStrength') this.config.motion.parallaxStrength = parseFloat(value);
    if (key === 'zoomAmount') this.config.motion.zoomAmount = parseFloat(value);
    if (key === 'darkness') {
      this.config.visual.darkness = parseFloat(value);
      document.documentElement.style.setProperty('--cinematic-darkness', value);
    }
    if (key === 'contrast') {
      this.config.visual.contrast = parseFloat(value);
      document.documentElement.style.setProperty('--cinematic-contrast', value);
    }
    if (key === 'blur') {
      this.config.visual.blur = parseFloat(value);
      document.documentElement.style.setProperty('--cinematic-blur', `${value}px`);
    }
    this.setScrollProgress(this.scrollProgress);
  }

  init() {
    // 1. Verify WebGL Capability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        this.isWebGLSupported = false;
        console.warn('WebGL not supported on this device. Activating graceful CSS fallback.');
        return;
      }
    } catch (e) {
      this.isWebGLSupported = false;
      return;
    }

    if (!this.container) {
      console.warn('CinematicSceneManager: Target container is missing.');
      return;
    }

    // 2. Setup Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070913, 0.016);

    // 3. Setup Camera with responsive mobile framing
    const isMobile = this.width < 768;
    const baseFov = isMobile ? 66 : 52;
    this.camera = new THREE.PerspectiveCamera(baseFov, this.width / this.height, 0.1, 350);
    this.camera.position.set(0, 0, 7);

    // 4. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: isMobile ? 'default' : 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.8)); // Capped for butter-smooth framerate
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Graceful context loss management for mobile app switching
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    }, false);

    // 5. Setup Cinematic Lighting
    this.setupLighting();

    // 6. Build Environment & Objects
    this.objects = createCinematicEnvironment();
    this.scene.add(this.objects.group);

    // 7. Event Listeners
    this.addEvents();

    // 8. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Ambient soft blue fill
    const ambientLight = new THREE.AmbientLight(0x0f172a, this.config.lighting.ambientIntensity);
    this.scene.add(ambientLight);

    // Key directional light (cyan-tinted)
    const keyLight = new THREE.DirectionalLight(0x38bdf8, this.config.lighting.keyLightIntensity);
    keyLight.position.set(8, 12, 10);
    this.scene.add(keyLight);

    // Lavender backlight for cinematic edge highlights
    const backLight = new THREE.DirectionalLight(0xc084fc, this.config.lighting.backLightIntensity);
    backLight.position.set(-10, -5, -8);
    this.scene.add(backLight);

    // Traveling Point Light following scene camera focus
    this.travelLight = new THREE.PointLight(0x38bdf8, this.config.lighting.travelLightIntensity, 45);
    this.travelLight.position.set(0, 2, 5);
    this.scene.add(this.travelLight);
  }

  addEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('orientationchange', () => setTimeout(this.onResize.bind(this), 250));
    window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.camera && this.renderer) {
      const isMobile = this.width < 768;
      this.camera.fov = isMobile ? 66 : 52;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.8));
    }
  }

  onMouseMove(e) {
    // Normalized [-1, 1]
    this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
    this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));

    const zStart = 7;
    const zEnd = -this.config.motion.zoomAmount;
    this.targetCameraZ = zStart + (zEnd - zStart) * this.scrollProgress;

    const isMobile = this.width < 768;
    const xRatio = isMobile ? 0.45 : 1.0;

    // Dynamic camera offsets for cinematic cinematography (tamed for mobile screens)
    if (this.scrollProgress < 0.15) {
      this.targetCameraX = 0;
      this.targetCameraY = 0;
      this.targetLookZ = this.targetCameraZ - 8;
    } else if (this.scrollProgress < 0.32) {
      // Move camera left to look toward right-hand laptop workspace
      this.targetCameraX = -1.8 * xRatio;
      this.targetCameraY = isMobile ? 0.3 : 0.5;
      this.targetLookZ = this.targetCameraZ - 8;
    } else if (this.scrollProgress < 0.48) {
      // Slight serpentine weave for journey
      const p = (this.scrollProgress - 0.32) / 0.16;
      this.targetCameraX = Math.sin(p * Math.PI * 2) * (1.5 * xRatio);
      this.targetCameraY = 0.2;
      this.targetLookZ = this.targetCameraZ - 6;
    } else if (this.scrollProgress < 0.64) {
      // Skills overview angle
      this.targetCameraX = 0;
      this.targetCameraY = 1.2;
      this.targetLookZ = -78;
    } else if (this.scrollProgress < 0.80) {
      // Projects elevation
      this.targetCameraX = 0;
      this.targetCameraY = 0.8;
      this.targetLookZ = -112;
    } else {
      // Code, Education, Future & Contact
      this.targetCameraX = 0;
      this.targetCameraY = 0.3;
      this.targetLookZ = this.targetCameraZ - 10;
    }

    if (this.travelLight) {
      this.travelLight.position.set(this.targetCameraX, this.targetCameraY + 1.5, this.targetCameraZ - 2);
    }
  }

  animate() {
    if (!this.renderer || !this.scene || !this.camera) return;

    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const speedMult = this.config.motion.animationSpeed;
    const elapsedTime = this.clock.getElapsedTime() * speedMult;

    // Subtle autonomous float if user is on mobile / not moving cursor
    const autoX = Math.sin(elapsedTime * 0.4) * 0.15;
    const autoY = Math.cos(elapsedTime * 0.3) * 0.1;
    const targetX = this.mouse.targetX || autoX;
    const targetY = this.mouse.targetY || autoY;

    // Mouse smoothing (lerp) & configurable parallax
    const parallaxFactor = this.config.motion.parallaxStrength * 10;
    this.mouse.x += (targetX - this.mouse.x) * 0.05;
    this.mouse.y += (targetY - this.mouse.y) * 0.05;

    // Smooth camera motion
    const lerpFactor = 0.06;
    this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * lerpFactor;
    this.camera.position.x += (this.targetCameraX + this.mouse.x * parallaxFactor - this.camera.position.x) * lerpFactor;
    this.camera.position.y += (this.targetCameraY + this.mouse.y * (parallaxFactor * 0.7) - this.camera.position.y) * lerpFactor;

    this.camera.lookAt(
      this.camera.position.x * 0.3,
      this.camera.position.y * 0.3,
      this.targetLookZ
    );

    // Continuous 3D Object Choreography
    if (this.objects) {
      const {
        celestialOrb,
        atmosphereHalo,
        peacefulRing1,
        peacefulRing2,
        heroGroup,
        laptopGroup,
        dbGroup,
        gitGroup,
        skillSun,
        skillNodeMeshes,
        starField,
        runeGroup
      } = this.objects;

      // 1. Smooth, Peaceful Celestial Horizon Animation (Hero Scene)
      if (celestialOrb) {
        const breathe = 1 + Math.sin(elapsedTime * 0.6) * 0.035;
        celestialOrb.scale.set(breathe, breathe, breathe);
        celestialOrb.rotation.y = elapsedTime * 0.04;
      }
      if (atmosphereHalo) {
        const haloBreathe = 1 + Math.sin(elapsedTime * 0.6 + 0.4) * 0.05;
        atmosphereHalo.scale.set(haloBreathe, haloBreathe, haloBreathe);
      }
      if (peacefulRing1) {
        peacefulRing1.rotation.z = elapsedTime * 0.05;
      }
      if (peacefulRing2) {
        peacefulRing2.rotation.z = -elapsedTime * 0.035;
      }
      if (heroGroup) {
        heroGroup.position.y = -0.4 + Math.sin(elapsedTime * 0.5) * 0.08;
      }

      // 2. About Workspace gentle float
      if (laptopGroup) {
        laptopGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.12;
      }
      if (dbGroup) {
        dbGroup.position.y = -0.6 + Math.cos(elapsedTime * 1.2) * 0.08;
      }
      if (gitGroup) {
        gitGroup.rotation.y = elapsedTime * 0.3;
      }

      // 3. Skills Universe Orbit
      if (skillSun) {
        skillSun.rotation.y = elapsedTime * 0.3;
      }
      if (skillNodeMeshes) {
        skillNodeMeshes.forEach(node => {
          const u = node.userData;
          u.angle += u.speed;
          node.position.x = Math.cos(u.angle) * u.radius;
          node.position.z = Math.sin(u.angle) * u.radius;
          node.position.y = Math.sin(elapsedTime * 2 + u.index) * 0.35;
          node.rotation.y = elapsedTime * 0.8;
        });
      }

      // 4. Code Runes Orbit
      if (runeGroup) {
        runeGroup.rotation.y = elapsedTime * 0.25;
      }

      // 5. Starfield gentle drift
      if (starField) {
        starField.rotation.z = elapsedTime * 0.015;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
