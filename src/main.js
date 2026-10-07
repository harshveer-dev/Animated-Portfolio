/**
 * Main Application Orchestrator for Harshveer Singh's Portfolio
 */

import { portfolioData } from './data/portfolio.js';
import { ScrollChoreographer } from './animations/scrollEffects.js';
import { CinematicSceneManager } from './three/sceneManager.js';
import { soundFx } from './audio/soundEffects.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Dynamic Content from Portfolio Data
  renderAboutSection();
  renderJourneyTimeline();
  renderSkillsUniverse();
  renderFeaturedProjects();
  renderMicroProjects();
  renderLiveShowcase();
  renderCodeShowcase();
  renderEducation();
  renderFutureVision();
  renderSocialLinks();

  // 2. Initialize 3D Cinematic Scene Manager (Three.js WebGL Corridor & 3D Objects)
  const webglContainer = document.getElementById('webgl-container');
  let sceneManager = null;
  if (webglContainer) {
    try {
      sceneManager = new CinematicSceneManager(webglContainer);
      window.sceneManager = sceneManager;
    } catch (err) {
      console.warn('Failed to initialize 3D scene:', err);
    }
  }

  // 3. Initialize Butter-Smooth Scroll Choreography (Lenis + 3D Camera Travel)
  const choreographer = new ScrollChoreographer(sceneManager);
  window.choreographer = choreographer;

  // 4. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 5. Contact Form / Quick Message Generator
  setupContactModule();

  // 6. Initialize Code Tab Switcher
  setupCodeTabs();

  // 7. Initialize Audio & HUD Controls
  setupHudControls(sceneManager);

  // 8. Initialize Mobile Responsive Navigation Drawer
  setupMobileMenu();

  // 9. Initialize Smooth Site Entrance Veil (Preloader)
  setupSiteLoader(choreographer);
});

// Render Functions
function renderAboutSection() {
  const bioContainer = document.getElementById('about-bio-text');
  const focusContainer = document.getElementById('about-focus-pills');

  if (bioContainer) {
    bioContainer.textContent = portfolioData.personal.bio;
  }

  if (focusContainer) {
    focusContainer.innerHTML = portfolioData.personal.focusAreas
      .map(area => `<span class="focus-pill"><i data-lucide="check" class="icon-sm"></i> ${area}</span>`)
      .join('');
  }
}

function renderJourneyTimeline() {
  const container = document.getElementById('journey-timeline-container');
  if (!container) return;

  container.innerHTML = portfolioData.journey.map((step, idx) => `
    <div class="timeline-item" data-step="${idx}">
      <div class="timeline-dot">
        <span class="dot-inner"></span>
      </div>
      <div class="timeline-card cinematic-glass-card">
        <div class="card-meta">
          <span class="milestone-badge">${step.category}</span>
          <span class="milestone-year">${step.year}</span>
        </div>
        <h3 class="milestone-title">${step.milestone}</h3>
        <p class="milestone-desc">${step.description}</p>
        <div class="milestone-highlight">
          <i data-lucide="sparkle" class="icon-xs text-cyan"></i>
          <span>${step.highlight}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSkillsUniverse() {
  const gridContainer = document.getElementById('skills-nodes-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = portfolioData.skills.map((skill) => `
    <div class="skill-node-card cinematic-glass-card" style="--skill-color: ${skill.color}">
      <div class="skill-node-header">
        <div class="skill-orbit-dot" style="background-color: ${skill.color}; box-shadow: 0 0 14px ${skill.color}"></div>
        <span class="skill-category">${skill.category}</span>
      </div>
      <h3 class="skill-name">${skill.name}</h3>
      <div class="skill-level">${skill.level}</div>
      <p class="skill-desc">${skill.description}</p>
    </div>
  `).join('');
}

function renderFeaturedProjects() {
  const container = document.getElementById('featured-projects-container');
  if (!container) return;

  container.innerHTML = portfolioData.projects.featured.map((proj) => `
    <div class="project-cinematic-card cinematic-glass-card" id="project-${proj.id}">
      <div class="project-header">
        <div class="project-type-badge">${proj.badge}</div>
        <span class="project-category">${proj.category}</span>
      </div>

      <div class="project-body">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-tagline">${proj.tagline}</p>
        <p class="project-description">${proj.description}</p>

        <div class="project-features">
          <h4 class="features-label">Core Implementation:</h4>
          <ul>
            ${proj.features.map(f => `<li><i data-lucide="chevron-right" class="icon-xs text-cyan"></i> ${f}</li>`).join('')}
          </ul>
        </div>

        <div class="project-tech-stack">
          ${proj.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      </div>

      <div class="project-footer">
        ${proj.liveUrl ? `
          <a href="${proj.liveUrl}" target="${proj.liveUrl.startsWith('http') ? '_blank' : '_self'}" rel="noopener noreferrer" class="btn-primary btn-magnetic">
            <span>${proj.isLive ? 'VIEW LIVE PROJECT →' : 'EXPLORE'}</span>
            <i data-lucide="external-link" class="icon-sm"></i>
          </a>
        ` : ''}
        ${proj.repo ? `
          <a href="${proj.repo}" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-magnetic">
            <i data-lucide="github" class="icon-sm"></i>
            <span>VIEW CODE / GITHUB</span>
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderMicroProjects() {
  const container = document.getElementById('micro-projects-grid');
  if (!container) return;

  container.innerHTML = portfolioData.projects.microProjects.map(p => `
    <div class="micro-project-card cinematic-glass-card">
      <div class="micro-card-top">
        <span class="micro-tag">${p.tag}</span>
        <i data-lucide="folder-git-2" class="icon-sm text-cyan"></i>
      </div>
      <h4 class="micro-title">${p.name}</h4>
      <p class="micro-desc">${p.desc}</p>
      <div class="micro-tech">${p.tech}</div>
    </div>
  `).join('');
}

function renderLiveShowcase() {
  const container = document.getElementById('live-project-details');
  if (!container) return;

  const agnhub = portfolioData.projects.featured.find(p => p.id === 'agnhub');
  if (!agnhub) return;

  container.innerHTML = `
    <div class="live-highlight-content">
      <div class="live-indicator-wrapper">
        <span class="live-pulse-dot"></span>
        <span class="live-label">LIVE & ACTIVE WEB PLATFORM</span>
      </div>
      <h3 class="live-headline">AGNHUB — Institute & Student Web Resource Platform</h3>
      <p class="live-subtext">${agnhub.description}</p>
      <div class="live-tags">
        ${agnhub.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      <div class="live-action-buttons">
        <a href="https://agnhub.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn-primary btn-magnetic btn-lg">
          <span>VIEW LIVE PROJECT →</span>
          <i data-lucide="external-link" class="icon-sm"></i>
        </a>
        <a href="https://github.com/harshveer-dev" target="_blank" rel="noopener noreferrer" class="btn-secondary btn-magnetic btn-lg">
          <i data-lucide="github" class="icon-sm"></i>
          <span>GITHUB REPOSITORY</span>
        </a>
      </div>
    </div>
  `;
}

function renderCodeShowcase() {
  const codeContentElem = document.getElementById('code-editor-content');
  const codeFilenameElem = document.getElementById('code-current-filename');
  if (!codeContentElem || !codeFilenameElem) return;

  // Render initial snippet (Python)
  const initial = portfolioData.codeShowcase[0];
  codeFilenameElem.textContent = initial.file;
  codeContentElem.textContent = initial.code;
}

function setupCodeTabs() {
  const tabButtons = document.querySelectorAll('.code-tab-btn');
  const codeContentElem = document.getElementById('code-editor-content');
  const codeFilenameElem = document.getElementById('code-current-filename');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const langKey = btn.dataset.tab;
      const snippet = portfolioData.codeShowcase.find(s => s.tab.toLowerCase().includes(langKey.toLowerCase()));
      if (snippet && codeContentElem && codeFilenameElem) {
        codeFilenameElem.textContent = snippet.file;
        codeContentElem.textContent = snippet.code;
      }
    });
  });

  const copyBtn = document.getElementById('btn-copy-code');
  if (copyBtn && codeContentElem) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeContentElem.textContent).then(() => {
        copyBtn.textContent = 'COPIED!';
        setTimeout(() => { copyBtn.textContent = 'COPY CODE'; }, 2000);
      });
    });
  }
}

function renderEducation() {
  const degreeElem = document.getElementById('edu-degree');
  const statusElem = document.getElementById('edu-status');
  const overviewElem = document.getElementById('edu-overview');
  const curriculumElem = document.getElementById('edu-curriculum-list');

  if (degreeElem) degreeElem.textContent = portfolioData.education.program;
  if (statusElem) statusElem.textContent = portfolioData.education.yearStatus;
  if (overviewElem) overviewElem.textContent = portfolioData.education.overview;

  if (curriculumElem) {
    curriculumElem.innerHTML = portfolioData.education.curriculumAreas.map(c => `
      <div class="edu-topic-card cinematic-glass-card">
        <h4 class="topic-title"><i data-lucide="bookmark" class="icon-xs text-cyan"></i> ${c.name}</h4>
        <p class="topic-detail">${c.detail}</p>
      </div>
    `).join('');
  }
}

function renderFutureVision() {
  const container = document.getElementById('vision-goals-grid');
  if (!container) return;

  container.innerHTML = portfolioData.futureVision.goals.map((g, i) => `
    <div class="vision-card cinematic-glass-card">
      <div class="vision-number">0${i + 1}</div>
      <h4 class="vision-title">${g.title}</h4>
      <p class="vision-desc">${g.desc}</p>
    </div>
  `).join('');
}

function renderSocialLinks() {
  const { github, linkedin, instagram, email } = portfolioData.personal.social;

  const socialAnchors = {
    'link-github': github,
    'link-linkedin': linkedin,
    'link-instagram': instagram,
    'link-email': `mailto:${email}`,
    'footer-link-github': github,
    'footer-link-linkedin': linkedin,
    'footer-link-instagram': instagram,
    'footer-link-email': `mailto:${email}`
  };

  Object.entries(socialAnchors).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('href', url);
      if (!url.startsWith('mailto')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  const emailDisplay = document.getElementById('contact-email-display');
  if (emailDisplay) emailDisplay.textContent = email;
}

function setupContactModule() {
  const copyEmailBtn = document.getElementById('btn-copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(portfolioData.personal.social.email).then(() => {
        const orig = copyEmailBtn.innerHTML;
        copyEmailBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> COPIED!';
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => { copyEmailBtn.innerHTML = orig; if (window.lucide) window.lucide.createIcons(); }, 2500);
      });
    });
  }
}

function setupHudControls(sceneManager) {
  // Audio SFX Toggle
  const audioBtn = document.getElementById('hud-audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isEnabled = soundFx.toggle();
      audioBtn.classList.toggle('audio-active', isEnabled);
      const icon = audioBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Cinematic Studio Tuner Drawer
  const studioBtn = document.getElementById('hud-studio-btn');
  const studioPanel = document.getElementById('cinematic-studio-panel');
  const studioCloseBtn = document.getElementById('studio-close-btn');

  if (studioBtn && studioPanel) {
    studioBtn.addEventListener('click', () => {
      studioPanel.classList.toggle('open');
      soundFx.playClick();
    });
  }

  if (studioCloseBtn && studioPanel) {
    studioCloseBtn.addEventListener('click', () => {
      studioPanel.classList.remove('open');
      soundFx.playClick();
    });
  }

  // Sliders
  const setupSlider = (sliderId, valId, key, formatFn) => {
    const slider = document.getElementById(sliderId);
    const valElem = document.getElementById(valId);
    if (!slider || !valElem) return;

    slider.addEventListener('input', (e) => {
      const val = e.target.value;
      valElem.textContent = formatFn ? formatFn(val) : val;
      if (sceneManager) {
        sceneManager.applyLiveConfig(key, val);
      }
    });
  };

  setupSlider('slider-speed', 'val-speed', 'animationSpeed', v => `${parseFloat(v).toFixed(1)}x`);
  setupSlider('slider-parallax', 'val-parallax', 'parallaxStrength', v => parseFloat(v).toFixed(2));
  setupSlider('slider-zoom', 'val-zoom', 'zoomAmount', v => `${v}m`);
  setupSlider('slider-darkness', 'val-darkness', 'darkness', v => `${Math.round(v * 100)}%`);
  setupSlider('slider-contrast', 'val-contrast', 'contrast', v => parseFloat(v).toFixed(2));
  setupSlider('slider-blur', 'val-blur', 'blur', v => `${v}px`);

  // Reset defaults
  const resetBtn = document.getElementById('studio-reset-btn');
  if (resetBtn && sceneManager) {
    resetBtn.addEventListener('click', () => {
      const defaults = {
        'slider-speed': ['1.0', '1.0x', 'animationSpeed'],
        'slider-parallax': ['0.06', '0.06', 'parallaxStrength'],
        'slider-zoom': ['189', '189m', 'zoomAmount'],
        'slider-darkness': ['0.65', '65%', 'darkness'],
        'slider-contrast': ['1.12', '1.12', 'contrast'],
        'slider-blur': ['0', '0px', 'blur']
      };

      Object.entries(defaults).forEach(([id, [val, label, key]]) => {
        const input = document.getElementById(id);
        const valElem = document.getElementById(id.replace('slider-', 'val-'));
        if (input) input.value = val;
        if (valElem) valElem.textContent = label;
        sceneManager.applyLiveConfig(key, val);
      });

      soundFx.playChime();
    });
  }

  // Mobile Navigation Drawer Audio SFX Toggle
  const mobileAudioBtn = document.getElementById('mobile-audio-btn');
  if (mobileAudioBtn) {
    mobileAudioBtn.addEventListener('click', () => {
      const isEnabled = soundFx.toggle();
      mobileAudioBtn.classList.toggle('audio-active', isEnabled);
      if (audioBtn) audioBtn.classList.toggle('audio-active', isEnabled);
      const icon = mobileAudioBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
        if (window.lucide) window.lucide.createIcons();
      }
      if (audioBtn) {
        const desktopIcon = audioBtn.querySelector('i');
        if (desktopIcon) {
          desktopIcon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  // Mobile Navigation Drawer Studio Tuner Trigger
  const mobileStudioBtn = document.getElementById('mobile-studio-btn');
  if (mobileStudioBtn && studioPanel) {
    mobileStudioBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('close-mobile-nav'));
      studioPanel.classList.add('open');
      soundFx.playClick();
    });
  }
}

/**
 * Mobile Navigation Drawer & Hamburger Menu Logic
 */
function setupMobileMenu() {
  const hamburgerBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const closeBtn = document.getElementById('mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburgerBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling while menu is open
    soundFx.playClick();
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburgerBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
      soundFx.playClick();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeDrawer();
      soundFx.playClick();
    });
  }

  backdrop.addEventListener('click', () => {
    closeDrawer();
  });

  // Listen to global close-mobile-nav event dispatched on link click
  window.addEventListener('close-mobile-nav', () => {
    closeDrawer();
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/**
 * Smooth Initial Opening Experience (Veil / Preloader)
 * Ensures zero flash of unstyled content, perfectly calibrated scroll height,
 * and a smooth cinematic entrance across all desktop and mobile devices.
 */
function setupSiteLoader(choreographer) {
  const loader = document.getElementById('site-loader');
  const fill = document.getElementById('loader-bar-fill');
  const status = document.getElementById('loader-status');

  if (!loader) return;

  let progress = 20;
  if (fill) fill.style.width = '20%';

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 15;
    if (progress > 95) progress = 95;
    if (fill) fill.style.width = `${progress}%`;
  }, 120);

  const dismissLoader = () => {
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    if (status) status.textContent = 'SYSTEM READY // WELCOME';

    setTimeout(() => {
      loader.classList.add('loaded');

      // Play soft chime if audio enabled
      soundFx.playChime();

      // Recalibrate smooth scroll engine & layout heights
      setTimeout(() => {
        if (choreographer && choreographer.lenis) {
          choreographer.lenis.resize();
        }
        window.dispatchEvent(new Event('resize'));
      }, 300);

      // Clean removal from DOM after transition finishes
      setTimeout(() => {
        loader.style.display = 'none';
      }, 900);
    }, 280);
  };

  // Wait for window load or max fallback of 1100ms
  if (document.readyState === 'complete') {
    setTimeout(dismissLoader, 350);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoader, 250));
    setTimeout(dismissLoader, 1100); // Safety fallback so user is never blocked
  }
}

