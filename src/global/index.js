/**
 * Global Code - Runs on Every Page
 * Add code here that should execute on all pages (navbar, footer, etc.)
 */

import { initLenis } from './lenis';
import { initNavbar, cleanupNavbar } from './navbar';
import { initFooter, cleanupFooter } from './footer';
import { handleGlobalAnimation, ensureGSAPLoaded } from '../components/gsap';
import { logger } from '../utils/logger';
import { initRive } from '../components/rive';
/**
 * Initialize all global components
 * This runs on every page before page-specific code
 */
export async function initGlobal() {
  logger.log('🌐 Initializing global components...');

  // Cleanup previous instances if re-initializing
  cleanupNavbar();
  cleanupFooter();
  initRive();
  // Initialize Lenis smooth scroll (should be first)
  initLenis();

  // Initialize navbar
  initNavbar();

  // Initialize footer
  initFooter();

  // Load GSAP first so all page code (tabs, home, etc.) has it available
  try {
    await ensureGSAPLoaded();
    logger.log('✅ GSAP and ScrollTrigger loaded globally');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await handleGlobalAnimation();
    gsapGlobalAnimations();
  } catch (error) {
    logger.error('Error loading GSAP:', error);
  }



  // Add any other global initializations here
  // Example: Cookie consent, analytics, chat widgets, etc.
}

/**
 * Additional GSAP global animations
 * Custom animations that run globally
 */
function gsapGlobalAnimations() {
  spheresMoveAnimation();
  cardMovementAnimation();
  themeChangeAnimation();
  freemiumSectionAnimation();
  sectionCTAanimation();
  shineMovementAnimation();
  clipSectionAnimation();
}

function spheresMoveAnimation() {
  const containers = Array.from(document.querySelectorAll('[spheres-move-anim]'));
  if (!containers.length) return;

  containers.forEach((container) => {
    const spheres = Array.from(container.querySelectorAll('.sphere .sphere-layers'));

    /* ----------------------------------
       RESPONSIVE CONFIG
    ---------------------------------- */
    const CONFIG = {
      desktop: { impactRadius: 500, maxOffset: 60 },
      mobile: { impactRadius: 420, maxOffset: 40 },
    };

    let impactRadius, maxOffset;

    const applyConfig = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const cfg = isMobile ? CONFIG.mobile : CONFIG.desktop;
      impactRadius = cfg.impactRadius;
      maxOffset = cfg.maxOffset;
      pickInitialSphere();
    };

    /* ----------------------------------
       STATE
    ---------------------------------- */
    let mouseX = 0,
      mouseY = 0;
    let ticking = false;
    let isActive = false;
    let isHovering = false;
    let initialSphere = null;
    const allowMouse = container.getAttribute('spheres-move-anim') === 'true';

    /* ----------------------------------
       INITIAL SPHERE (DESKTOP / MOBILE)
    ---------------------------------- */
    const pickInitialSphere = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      initialSphere = isMobile
        ? container.querySelector('.sphere .sphere-layers[initial-active-mobile="1"]')
        : container.querySelector('.sphere .sphere-layers[initial-active="1"]');
      if (!initialSphere) initialSphere = spheres[0] || null;
    };

    applyConfig();
    window.addEventListener('resize', applyConfig);

    /* ----------------------------------
       CORE INFLUENCE FUNCTION
    ---------------------------------- */
    function applyInfluence(sourceX, sourceY, isInitial = false) {
      let closestSphere = null;
      let minDistance = Infinity;
      const duration = isInitial ? 0.6 : 0.25;
      const ease = isInitial ? 'power2.out' : 'power3.out';

      spheres.forEach((sphere) => {
        const rect = sphere.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = sourceX - cx;
        const dy = sourceY - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance && distance <= impactRadius) {
          minDistance = distance;
          closestSphere = sphere;
        }

        const strength = Math.max(0, 1 - distance / impactRadius);
        const nx = dx / (distance || 1);
        const ny = dy / (distance || 1);
        const moveX = gsap.utils.clamp(-maxOffset, maxOffset, -nx * strength * maxOffset);
        const moveY = gsap.utils.clamp(-maxOffset, maxOffset, -ny * strength * maxOffset);

        // Layer-3 (move + scale)
        sphere.querySelectorAll('.sphere-layer-3').forEach((layer) => {
          gsap.to(layer, {
            xPercent: moveX,
            yPercent: moveY,
            scale: 1 + (1 - strength) * 0.6,
            duration,
            ease,
          });
        });

        // Layer-3a (20% stronger)
        sphere.querySelectorAll('.sphere-layer-3a').forEach((layer) => {
          gsap.to(layer, {
            xPercent: moveX * 1.2,
            yPercent: moveY * 1.2,
            duration,
            ease,
          });
        });

        // Glow movement
        sphere.querySelectorAll('.sphere-layer-glow').forEach((glow) => {
          if (glow.classList.contains('sphere-layer-4')) return;
          const boost = glow.classList.contains('white') ? 1.4 : 1;
          gsap.to(glow, {
            x: dx * 0.2 * boost,
            y: dy * 0.2 * boost,
            opacity: strength,
            duration: isInitial ? 0.35 : 0.15,
            ease,
          });
        });
      });

      // v1 / v3 class logic
      spheres.forEach((sphere) => {
        const rect = sphere.getBoundingClientRect();
        const dx = sourceX - (rect.left + rect.width / 2);
        const dy = sourceY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        sphere.querySelectorAll('*:not(.sphere-layer-glow)').forEach((el) => {
          if (el.classList.contains('sphere-layer-4')) return;

          if (distance <= impactRadius) {
            if (sphere === closestSphere) {
              el.classList.add('v3');
              el.classList.remove('v1');
            } else {
              el.classList.add('v1');
              el.classList.remove('v3');
            }
          } else {
            el.classList.remove('v1', 'v3');
          }
        });
      });
    }

    /* ----------------------------------
       RAF LOOP
    ---------------------------------- */
    function update() {
      if (!isActive) return;
      if (isHovering && allowMouse) {
        applyInfluence(mouseX, mouseY, false);
      } else if (initialSphere) {
        const r = initialSphere.getBoundingClientRect();
        applyInfluence(r.left + r.width / 2, r.top + r.height / 2, true);
      }
      ticking = false;
    }

    /* ----------------------------------
       MOUSE HANDLING
    ---------------------------------- */
    const onMouseMove = (e) => {
      if (!allowMouse) return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    /* ----------------------------------
       RESET
    ---------------------------------- */
    const resetAll = () => {
      spheres.forEach((sphere) => {
        sphere.querySelectorAll('*').forEach((el) => {
          if (!el.classList.contains('sphere-layer-4')) el.classList.remove('v1', 'v3');
        });

        sphere.querySelectorAll('.sphere-layer-3, .sphere-layer-3a').forEach((layer) => {
          gsap.to(layer, { xPercent: 0, yPercent: 0, scale: 1, duration: 0.5, ease: 'power2.out' });
        });

        sphere.querySelectorAll('.sphere-layer-glow').forEach((glow) => {
          if (glow.classList.contains('sphere-layer-4')) return;
          gsap.to(glow, { x: 0, y: 0, opacity: 0, duration: 0.4 });
        });
      });
    };

    /* ----------------------------------
       HOVER STATE
    ---------------------------------- */
    container.addEventListener('mouseenter', () => {
      isHovering = true;
    });
    container.addEventListener('mouseleave', () => {
      isHovering = false;
      resetAll();
      requestAnimationFrame(update);
    });

    /* ----------------------------------
       INTERSECTION OBSERVER
    ---------------------------------- */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isActive) {
              isActive = true;
              if (allowMouse) window.addEventListener('mousemove', onMouseMove);
              requestAnimationFrame(update);
            }
          } else {
            isActive = false;
            if (allowMouse) window.removeEventListener('mousemove', onMouseMove);
            resetAll();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
  });
}

// Card movement animation
function cardMovementAnimation() {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    const tracks = document.querySelectorAll('[cards-track]');

    if (tracks.length) {
      tracks.forEach((track) => {
        const intialY =
          parseFloat(getComputedStyle(track).getPropertyValue('--_size---cards-track-intial-y')) ||
          0;
        const finalY =
          parseFloat(getComputedStyle(track).getPropertyValue('--_size---cards-track-final-y')) ||
          -100;

        gsap.fromTo(
          track,
          { yPercent: intialY },
          {
            yPercent: finalY,
            scrollTrigger: {
              trigger: '[cards-section]',
              start: 'top 70%',
              end: 'bottom 40%',
              scrub: true,
              markers: false,
            },
          }
        );
      });
    }
  }
}

function themeChangeAnimation() {
  // Theme Change Animation
  if (!document.querySelector('[theme]')) return;
  document.querySelectorAll('[theme]').forEach((el) => {
    const originalTheme = el.getAttribute('theme');

    const stages = [
      {
        to: el.getAttribute('theme-change-to'),
        trigger: el.getAttribute('theme-change-trigger'),
      },
      {
        to: el.getAttribute('theme-change-to-2'),
        trigger: el.getAttribute('theme-change-trigger-2'),
      },
    ].filter((stage) => stage.to && stage.trigger);

    if (!stages.length) return;

    stages.forEach((stage, index) => {
      const triggerEls = document.querySelectorAll(stage.trigger);
      if (!triggerEls.length) return;

      triggerEls.forEach((triggerEl) => {
        ScrollTrigger.create({
          trigger: triggerEl,
          start: 'top 90%',
          onEnter: () => {
            el.setAttribute('theme', stage.to);
          },
          onEnterBack: () => {
            el.setAttribute('theme', stage.to);
          },
          onLeaveBack: () => {
            if (index === 0) {
              el.setAttribute('theme', originalTheme);
            } else {
              el.setAttribute('theme', stages[index - 1].to);
            }
          },
          markers: false,
        });
      });
    });
  });
}

function freemiumSectionAnimation() {
  if (!document.querySelector('[freemium-section]')) return;
  document.querySelectorAll('[freemium-section]').forEach((section) => {
    if (!section) return;

    const ff1 = section.querySelector('.circle-comp.ff-1');
    const ff2 = section.querySelector('.circle-comp.ff-2');
    const text = section.querySelector('[freemium-section-text]');

    // If section exists but nothing inside is animatable, skip
    if (!ff1 && !ff2 && !text) return;

    // Get CSS variables (safe even if some elements are missing)
    const rootStyles = getComputedStyle(document.documentElement);
    const initialSize = rootStyles
      .getPropertyValue('--_size---freemium-components--intial-size')
      .trim();
    const ff1Final = rootStyles
      .getPropertyValue('--_size---freemium-components--ff1-final-size')
      .trim();
    const ff2Final = rootStyles
      .getPropertyValue('--_size---freemium-components--ff2-final-size')
      .trim();

    // Responsive Y values
    const isMobile = window.innerWidth <= 768;

    const ff1InitialY = isMobile ? 10 : -50;
    const ff1FinalY = 90;

    const ff2InitialY = -150;
    const ff2FinalY = -70;

    // Initial styles (only if element exists)
    if (ff1) ff1.style.width = initialSize;
    if (ff2) ff2.style.width = initialSize;

    // Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        markers: false,
      },
    });

    const circleDuration = 1.2;
    const textDuration = 0.8;
    const staggerTime = 0.1;

    // ---- Circles ----
    if (ff1) {
      tl.fromTo(
        ff1,
        { width: initialSize, yPercent: ff1InitialY },
        { width: ff1Final, yPercent: ff1FinalY, duration: circleDuration, ease: 'power1.out' }
      );
    }

    if (ff2) {
      tl.fromTo(
        ff2,
        { width: initialSize, yPercent: ff2InitialY },
        { width: ff2Final, yPercent: ff2FinalY, duration: circleDuration, ease: 'power1.out' },
        ff1 ? '<' : 0 // sync with ff1 if it exists
      );
    }

    // ---- Text ----
    if (text) {
      const textChildren = Array.from(text.children);

      if (textChildren.length) {
        tl.from(
          textChildren,
          {
            opacity: 0,
            filter: 'blur(5px)',
            y: 20,
            stagger: staggerTime,
            duration: textDuration,
            ease: 'power1.out',
          },
          `-=${circleDuration * 0.2}`
        );
      } else {
        tl.from(
          text,
          {
            opacity: 0,
            filter: 'blur(5px)',
            y: 20,
            duration: textDuration,
            ease: 'power1.out',
          },
          `-=${circleDuration * 0.2}`
        );
      }
    }
  });
}

function sectionCTAanimation() {
  if (!document.querySelectorAll('[section-cta]')) return;
  document.querySelectorAll('[section-cta]').forEach((section) => {
    if (!section) return;

    const frame = section.querySelector('.dashboard-frame.for-cta');
    const circle = section.querySelector('.circle-comp.for-cta');

    if (!frame || !circle) return;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          end: '50% 50%',
          scrub: true,
          markers: false,
        },
      })
      .to(frame, {
        rotationY: 0,
        y: 0,
        ease: 'power1.out',
      })
      .from(
        circle,
        {
          opacity: 0.1,
          ease: 'power1.out',
        },
        '<'
      );
  });
}

function shineMovementAnimation() {
  // Only run on desktop (hover capable)
  if (!window.matchMedia('(hover: hover)').matches) return;

  const areas = document.querySelectorAll('[shine-mover-area]');
  if (!areas.length) return;

  areas.forEach((area) => {
    // Prevent double initialization
    if (area.dataset.shineInit) return;
    area.dataset.shineInit = 'true';

    const point = area.querySelector('[shine-point]');
    if (!point) return;

    // Ensure point is absolute inside the area
    point.style.position = 'absolute';
    point.style.pointerEvents = 'none';
    point.style.transition = 'transform 0.05s ease';

    let rafId = null;

    const onMouseMove = (e) => {
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left - point.offsetWidth / 2;
      const y = e.clientY - rect.top - point.offsetHeight / 2;

      // Use requestAnimationFrame for smooth performance
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        point.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    const onMouseLeave = () => {
      // nothing here, CSS can handle fade out
    };

    // Attach events **only on hover**
    area.addEventListener('mouseenter', () => {
      area.addEventListener('mousemove', onMouseMove);
      area.addEventListener('mouseleave', onMouseLeave);
    });

    area.addEventListener('mouseleave', () => {
      area.removeEventListener('mousemove', onMouseMove);
      area.removeEventListener('mouseleave', onMouseLeave);
    });
  });
}

function clipSectionAnimation() {
  if (!document.querySelector('[cliped-section="anim"]')) return;
  document.querySelectorAll('[cliped-section="anim"]').forEach((el) => {
    const style = getComputedStyle(el);
    const padding = style.getPropertyValue('--_size---clip-padding').trim();
    const radius = style.getPropertyValue('--_size---clip-radius').trim();

    gsap.fromTo(
      el,
      { clipPath: `inset(0px round 0px)` },
      {
        clipPath: `inset(${padding} round ${radius})`,
        ease: 'ease',
        scrollTrigger: {
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: true,
          markers: false,
        },
      }
    );
  });
}
