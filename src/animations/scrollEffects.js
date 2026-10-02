/**
 * Scroll Choreography & GSAP ScrollTrigger Coordinator
 * Links document scroll position with 3D camera travel and HTML micro-interactions
 */

import { soundFx } from '../audio/soundEffects.js';

export class ScrollChoreographer {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.progressBar = document.getElementById('scroll-progress-fill');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section[id]');
    this.currentActiveSection = 'hero';

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.setupSmoothScroll();
    this.setupIntersectionObserver();
    this.setupNavClicks();
    this.setupMagneticButtons();
    this.setupCursorGlow();
  }

  setupSmoothScroll() {
    // If Lenis is loaded and reduced motion is false, use momentum inertia smooth scrolling
    if (typeof window.Lenis !== 'undefined' && !this.prefersReducedMotion) {
      this.lenis = new window.Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.6,
        infinite: false
      });

      // Expose globally for convenience
      window.lenis = this.lenis;

      // Synchronize RAF loop
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Listen to scroll events from Lenis
      this.lenis.on('scroll', ({ scroll, limit }) => {
        const progress = limit > 0 ? Math.max(0, Math.min(1, scroll / limit)) : 0;
        this.broadcastProgress(progress);
      });

      // Initial progress calculation
      const initialProgress = this.lenis.limit > 0 ? this.lenis.scroll / this.lenis.limit : 0;
      this.broadcastProgress(initialProgress);

      // Recalibrate on load and resize to ensure exact scroll bounding
      window.addEventListener('load', () => {
        if (this.lenis) {
          this.lenis.resize();
          const limit = this.lenis.limit;
          const prog = limit > 0 ? Math.max(0, Math.min(1, this.lenis.scroll / limit)) : 0;
          this.broadcastProgress(prog);
        }
      });

      window.addEventListener('resize', () => {
        if (this.lenis) {
          this.lenis.resize();
        }
      });
    } else {
      // Fallback native scroll listener
      this.setupNativeScrollListener();
    }
  }

  setupNativeScrollListener() {
    let ticking = false;
    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const progress = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
      this.broadcastProgress(progress);
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    updateProgress();
    window.addEventListener('load', updateProgress);
    window.addEventListener('resize', updateProgress);
  }

  broadcastProgress(progress) {
    // Update 3D Camera Rig
    if (this.sceneManager) {
      this.sceneManager.setScrollProgress(progress);
    }

    // Update Top Progress Bar
    if (this.progressBar) {
      this.progressBar.style.width = `${progress * 100}%`;
    }

    // Update HUD scene coordinates readout
    const hudCoord = document.getElementById('hud-depth-metric');
    if (hudCoord) {
      const zDepth = Math.round(7 - progress * 189);
      hudCoord.textContent = `DEPTH: ${zDepth}m // SCENE: ${(progress * 100).toFixed(0)}%`;
    }

    // Subtle parallax on celestial backdrop image
    const backdropImg = document.getElementById('peaceful-backdrop-img');
    if (backdropImg) {
      backdropImg.style.transform = `scale(${1 + progress * 0.08}) translateY(${-progress * 25}px) translateZ(0)`;
    }
  }

  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id && id !== this.currentActiveSection) {
            this.currentActiveSection = id;
            this.updateActiveNav(id);
            soundFx.playTransition();

            // Trigger section reveal animation
            entry.target.classList.add('scene-visible');
          }
        }
      });
    }, observerOptions);

    this.sections.forEach(section => observer.observe(section));
  }

  updateActiveNav(activeId) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const currentSceneBadge = document.getElementById('hud-scene-name');
    if (currentSceneBadge) {
      currentSceneBadge.textContent = activeId.toUpperCase();
    }
  }

  setupNavClicks() {
    const allInternalAnchors = document.querySelectorAll('a[href^="#"]');
    allInternalAnchors.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          soundFx.playClick();
          if (this.lenis) {
            this.lenis.scrollTo(targetElem, {
              duration: 1.3,
              offset: 0,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            targetElem.scrollIntoView({
              behavior: this.prefersReducedMotion ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        }
      });

      link.addEventListener('mouseenter', () => soundFx.playHover());
    });
  }

  setupMagneticButtons() {
    if (this.prefersReducedMotion) return;

    const magneticElements = document.querySelectorAll('.btn-magnetic');
    magneticElements.forEach(elem => {
      elem.addEventListener('mousemove', (e) => {
        const rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        elem.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      elem.addEventListener('mouseleave', () => {
        elem.style.transform = 'translate(0px, 0px)';
      });

      elem.addEventListener('mouseenter', () => soundFx.playHover());
      elem.addEventListener('click', () => soundFx.playClick());
    });
  }

  setupCursorGlow() {
    const cursor = document.getElementById('cursor-glow');
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });
  }
}
