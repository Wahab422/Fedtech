import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initTabs } from '../components/tabs/tabsComp1';
import { ensureGSAPLoaded } from '../components/gsap';

const cleanupFunctions = [];

export async function initHomePage() {
  logger.log('🏠 Home page initialized');

  try {
    await ensureGSAPLoaded();
    const tabsCleanup = initTabs();
    if (tabsCleanup) cleanupFunctions.push(tabsCleanup);
    initHomeAnimations();
  } catch (error) {
    handleError(error, 'Home Page Initialization');
  }
}

export function cleanupHomePage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Home Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}

function initHomeAnimations() {
  (() => {
    const rotators = document.querySelectorAll('[text-fade-rotate]');
    if (!rotators.length) return; // exit if no elements

    rotators.forEach((rotator) => {
      const texts = rotator.getAttribute('text-fade-rotate').split(',');
      if (!texts.length) return;

      let index = 0;
      let opacity = 1; // start fully visible
      let fadingIn = true;

      // Read custom attributes or defaults
      const stayDuration = parseInt(rotator.getAttribute('data-delay')) || 1000; // how long text stays fully visible
      const startDelay = parseInt(rotator.getAttribute('data-start')) || 2000; // delay before starting after in view
      const fadeDuration = 500; // fade-in/out duration

      // Keep current text as default text initially
      const defaultText = rotator.textContent.trim() || texts[0];
      rotator.textContent = defaultText;

      rotator.style.opacity = 1; // default text visible
      rotator.style.display = 'inline';
      rotator.style.transition = 'none';

      let lastTime = performance.now();
      let stayTimer = 0;
      let animationStarted = false;

      function animate(time) {
        if (!animationStarted) return;

        const delta = time - lastTime;
        lastTime = time;

        if (fadingIn) {
          opacity += delta / fadeDuration;
          if (opacity >= 1) {
            opacity = 1;
            fadingIn = false;
            stayTimer = 0;
          }
        } else {
          stayTimer += delta;
          if (stayTimer >= stayDuration) {
            opacity -= delta / fadeDuration;
            if (opacity <= 0) {
              opacity = 0;
              index = (index + 1) % texts.length;
              rotator.textContent = texts[index];
              fadingIn = true;
            }
          }
        }

        rotator.style.opacity = opacity;
        requestAnimationFrame(animate);
      }

      // IntersectionObserver to start animation when element is in view
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                animationStarted = true;
                // If the current text is the default text, start rotation from the next index
                if (rotator.textContent === defaultText) {
                  index = texts.indexOf(defaultText) + 1;
                  if (index >= texts.length) index = 0;
                }
                lastTime = performance.now();
                requestAnimationFrame(animate);
              }, startDelay);
              obs.unobserve(entry.target); // run only once
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(rotator);
    });
  })();

  //
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  document.querySelectorAll('[intro-section]').forEach((section) => {
    const triggers = {
      seq1: section.querySelector('[screen-trigger="1"]'),
      seq2: section.querySelector('[screen-trigger="2"]'),
    };

    if (!triggers.seq1 || !triggers.seq2) return;

    const screen1Els = section.querySelectorAll('[screen-content="1"]');
    const screen2Els = section.querySelectorAll('[screen-content="2"]');
    const floteTags = section.querySelectorAll('.flote-tag');
    const bgLines = section.querySelectorAll('.circle-bg-lines');
    const gradientWraps = section.querySelectorAll('.circle-bg-gradient-line-wrap');

    // --------------------
    // Initial states
    // --------------------
    gsap.set([...screen1Els, ...screen2Els], { opacity: 0, filter: 'blur(5px)' });
    gsap.set(floteTags, { opacity: 0, scale: 0, filter: 'blur(5px)', width: 0 });
    gsap.set(bgLines, { opacity: 0 });
    gsap.set(gradientWraps, { opacity: 0 });

    /* =========================
       SEQUENCE 1
       ========================= */
    const seq1 = gsap.timeline({ paused: true });

    // Step 1: reveal circle-bg-lines
    seq1.to(bgLines, { opacity: 1, duration: 0.4, stagger: 0.08 });

    // Step 2: reveal flote tags with stagger
    seq1.to(
      floteTags,
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        width: 'auto',
        stagger: 0.18,
        ease: 'power2.out',
        duration: 0.6,
      },
      '<'
    );

    // Step 3: reveal screen-1 elements and children with blur removal
    screen1Els.forEach((screen) => {
      seq1.to(screen, { opacity: 1, filter: 'blur(0px)', duration: 0.3 }, '<0.1');
      seq1.from(
        screen.children,
        {
          opacity: 0,
          y: 24,
          filter: 'blur(5px)',
          stagger: 0.08,
          ease: 'power2.out',
          duration: 0.5,
          clearProps: 'filter',
        },
        '<0.15'
      );
    });

    // Step 4: reveal gradient wraps
    seq1.to(gradientWraps, { opacity: 1, duration: 0.4, stagger: 0.08 }, '<0.2');

    ScrollTrigger.create({
      trigger: triggers.seq1,
      start: 'top top',
      once: true,
      onEnter: () => seq1.play(),
    });

    /* =========================
       SEQUENCE 2
       ========================= */
    if (screen2Els.length) {
      const seq2 = gsap.timeline({ paused: true });

      // Step 1: fade out screen-1 elements and children
      screen1Els.forEach((screen) => {
        seq2.to(screen.children, {
          opacity: 0,
          y: 24,
          filter: 'blur(5px)',
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.in',
        });
        seq2.to(screen, { opacity: 0, duration: 0.3 }, '<0.1');
      });

      // Step 2: reveal screen-2 elements + children with blur removal
      screen2Els.forEach((screen) => {
        seq2.to(screen, { opacity: 1, filter: 'blur(0px)', duration: 0.3 }, '<0.1');
        seq2.from(
          screen.children,
          {
            opacity: 0,
            y: 24,
            filter: 'blur(5px)',
            stagger: 0.08,
            ease: 'power2.out',
            duration: 0.5,
            clearProps: 'filter',
          },
          '<0.15'
        );
      });

      // Step 3: animate flote-tag width stagger
      seq2.to(
        floteTags,
        {
          width: 'auto',
          stagger: 0.18,
          duration: 0.5,
          ease: 'power2.out',
        },
        '<'
      );

      ScrollTrigger.create({
        trigger: triggers.seq2,
        start: 'top top',
        onEnter: () => seq2.play(),
        onLeaveBack: () => seq2.reverse(),
      });
    }
  });
}
