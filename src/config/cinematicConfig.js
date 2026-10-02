/**
 * Centralized Cinematic Configuration for Harshveer Singh's Portfolio
 * Easily customize atmosphere, 3D camera travel, speeds, lighting, and visuals here.
 */

export const cinematicConfig = {
  // Visual Atmosphere & Backdrop
  visual: {
    darkness: 0.65,          // Background overlay opacity (0.0: bright, 1.0: deep dark)
    contrast: 1.12,          // Visual contrast multiplier
    blur: 0,                 // Background backdrop blur in pixels
    saturation: 1.08,        // Color saturation multiplier
    ambientGlowIntensity: 1.2,// Ambient celestial glow brightness
  },

  // Animation Speeds & Motion
  motion: {
    animationSpeed: 1.0,     // Global motion speed multiplier (0.5: ultra-calm, 2.0: fast)
    driftCadence: 0.04,      // Celestial orb & ring rotation speed
    breathingSpeed: 0.6,     // Sine wave pulse frequency for celestial orb
    transitionDuration: 1.2, // Section transition ease duration in seconds
    parallaxStrength: 0.06,  // Mouse parallax reactivity (0.0: static, 0.1: pronounced)
    zoomAmount: 189,         // Total camera Z traversal depth from Hero to Contact
  },

  // 3D Particles & Starfield
  particles: {
    density: 1800,           // Total particle count for cosmic starfield
    size: 0.14,              // Individual stardust particle size
    driftSpeed: 0.015,       // Particle rotation speed
    opacity: 0.75,           // Starfield particle opacity
    colors: {
      cyan: 0x38bdf8,
      lavender: 0xc084fc,
      indigo: 0x818cf8,
      emerald: 0x34d399
    }
  },

  // Lighting Balance
  lighting: {
    ambientIntensity: 1.5,
    keyLightIntensity: 2.0,
    backLightIntensity: 1.6,
    travelLightIntensity: 2.2,
  },

  // Responsive & Mobile Adaptations
  mobile: {
    reduceParticles: true,   // Halves particle count on mobile for 60 FPS performance
    mobileParticleCount: 800,
    disableMouseTilt: true,  // Avoid sensor jitter on touch devices
    simplifiedRings: true,
  }
};
