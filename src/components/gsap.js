/**
 * GSAP Animation Component (Shared Utility)
 * Lazy-loads GSAP + ScrollTrigger via jsDelivr and wires Webflow data-attributes to scroll animations.
 * Not global: import only on pages that need GSAP-driven effects.
 *
 * Usage:
 * 1) Import: import { initGSAP, ensureGSAPLoaded, handleGlobalAnimation, refreshScrollTrigger } from '../components/gsap';
 * 2) Call initGSAP() or handleGlobalAnimation() once after DOM is ready. The loader prevents duplicate inits and reuses any already-loaded GSAP/ScrollTrigger.
 * 3) Add data attributes in Webflow:
 *    - [anim-scale] -> scale-in on scroll
 *    - [anim-stagger=".child"] -> batch stagger children (from-y, data-delay, data-duration, data-easing, stagger-from, stagger-amount, scrollTrigger-start, anim-markers)
 *    - [anim-element] or .anim-element -> simple fade/slide (from-x/from-y, data-delay, data-duration, data-easing)
 *    - [parallax-element] -> desktop-only parallax
 *    - .bg-lines .bg-line -> background line drift
 *    - .content-divider -> content divider animation on scroll
 *    - [data-split-text="char|word|line"] -> SplitText helper (set window.GSAP_SPLIT_TEXT_URL to override CDN path)
 *
 * Extras:
 * - animate(), createTimeline(), createScrollTrigger() are exported for custom animations after ensureGSAPLoaded().
 * - Call refreshScrollTrigger() after DOM/layout changes; killAllScrollTriggers() on teardown.
 * - Safe to call initGSAP() multiple times; the loader guards against double-loading.
 */

import { handleError, loadScript, observeInView } from '../utils/helpers';
import { logger } from '../utils/logger';
import { loadLibrary, isLibraryLoaded } from '../utils/jsdelivr';

let gsapLoaded = false;
let scrollTriggerLoaded = false;
let splitTextLoaded = false;
let customEaseLoaded = false;
let animationsInitialized = false;
const SPLIT_TEXT_FALLBACK_URL = 'https://cdn.prod.website-files.com/gsap/3.13.0/SplitText.min.js';

/**
 * Wait for a global variable to be available
 */
function waitForGlobal(name, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window[name]) {
      resolve(window[name]);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window[name]) {
        clearInterval(checkInterval);
        resolve(window[name]);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`Timeout waiting for ${name} to load`));
      }
    }, 50);
  });
}

/**
 * Load GSAP library
 */
async function loadGSAP() {
  if (gsapLoaded || isLibraryLoaded('gsap')) {
    // If already marked as loaded, verify it's actually available
    if (typeof window.gsap === 'undefined') {
      await waitForGlobal('gsap');
    }
    return;
  }

  try {
    await loadLibrary('gsap', { loadCSS: false });
    // Wait for GSAP to be available on window
    await waitForGlobal('gsap');
    gsapLoaded = true;
  } catch (error) {
    handleError(error, 'GSAP Loader');
    throw error;
  }
}

/**
 * Load ScrollTrigger plugin
 */
async function loadScrollTrigger() {
  if (scrollTriggerLoaded || isLibraryLoaded('scrollTrigger')) {
    // If already marked as loaded, verify it's actually available
    if (typeof window.ScrollTrigger === 'undefined') {
      await waitForGlobal('ScrollTrigger');
    }
    return;
  }

  try {
    // loadLibrary will automatically load GSAP first (dependency)
    await loadLibrary('scrollTrigger', { loadCSS: false });

    // Wait for both GSAP and ScrollTrigger to be available
    await waitForGlobal('gsap');
    await waitForGlobal('ScrollTrigger');

    if (typeof window.gsap !== 'undefined' && window.gsap.registerPlugin) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      scrollTriggerLoaded = true;
    } else {
      throw new Error('GSAP registerPlugin not available');
    }
  } catch (error) {
    handleError(error, 'ScrollTrigger Loader');
    throw error;
  }
}

/**
 * Load SplitText plugin
 */
async function loadSplitText() {
  if (splitTextLoaded || isLibraryLoaded('splitText')) {
    if (typeof window.SplitText === 'undefined') {
      await waitForGlobal('SplitText');
    }
    splitTextLoaded = true;
    logger.log('[SplitText] SplitText already loaded.');
    return true;
  }

  try {
    const customUrl = typeof window !== 'undefined' ? window.GSAP_SPLIT_TEXT_URL : null;
    const urlToLoad = customUrl || SPLIT_TEXT_FALLBACK_URL;

    if (!customUrl) {
      logger.warn(
        `[SplitText] Using fallback SplitText URL. For control, set window.GSAP_SPLIT_TEXT_URL to your hosted SplitText.min.js path.`
      );
    }

    await loadScript(urlToLoad, { id: 'split-text-custom' });
    await waitForGlobal('SplitText');
    splitTextLoaded = true;
    logger.log('[SplitText] SplitText loaded.');
    return true;
  } catch (error) {
    handleError(error, 'SplitText Loader');
    return false;
  }
}

/**
 * Load CustomEase plugin
 */
async function loadCustomEase() {
  if (customEaseLoaded || isLibraryLoaded('customEase')) {
    if (typeof window.CustomEase === 'undefined') {
      await waitForGlobal('CustomEase');
    }
    if (window.gsap && window.gsap.registerPlugin && window.CustomEase) {
      window.gsap.registerPlugin(window.CustomEase);
    }
    customEaseLoaded = true;
    return;
  }

  try {
    await loadLibrary('customEase', { loadCSS: false });
    await waitForGlobal('CustomEase');
    if (window.gsap && window.gsap.registerPlugin && window.CustomEase) {
      window.gsap.registerPlugin(window.CustomEase);
    }
    customEaseLoaded = true;
  } catch (error) {
    handleError(error, 'CustomEase Loader');
    throw error;
  }
}

/**
 * Ensure GSAP and ScrollTrigger are loaded
 * Exported for use in global initialization
 * Syncs flags if GSAP was already loaded elsewhere
 */
export async function ensureGSAPLoaded() {
  // Check if GSAP is already loaded globally (from another source)
  if (typeof window.gsap !== 'undefined' && !gsapLoaded) {
    gsapLoaded = true;
  }
  if (typeof window.ScrollTrigger !== 'undefined' && !scrollTriggerLoaded) {
    scrollTriggerLoaded = true;
  }
  if (typeof window.CustomEase !== 'undefined' && !customEaseLoaded) {
    customEaseLoaded = true;
  }

  // Load if not already loaded
  if (!gsapLoaded) {
    await loadGSAP();
  }
  if (!scrollTriggerLoaded) {
    await loadScrollTrigger();
  }
  if (!customEaseLoaded) {
    await loadCustomEase();
  }

  // Final verification - wait a bit if needed
  if (typeof window.gsap === 'undefined') {
    try {
      await waitForGlobal('gsap', 2000);
    } catch (error) {
      throw new Error('GSAP failed to load: Script loaded but gsap object not available');
    }
  }

  if (typeof window.ScrollTrigger === 'undefined') {
    try {
      await waitForGlobal('ScrollTrigger', 2000);
    } catch (error) {
      throw new Error(
        'ScrollTrigger failed to load: Script loaded but ScrollTrigger object not available'
      );
    }
  }

  // Ensure ScrollTrigger is registered with GSAP
  if (window.gsap && window.gsap.registerPlugin && !window.gsap.plugins.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }
  if (
    window.gsap &&
    window.gsap.registerPlugin &&
    window.CustomEase &&
    !window.gsap.plugins.CustomEase
  ) {
    window.gsap.registerPlugin(window.CustomEase);
  }
}

/**
 * Initialize GSAP (backward compatibility)
 * Ensures GSAP is loaded and initializes global animations
 * Can be called from page-specific code if needed
 */
export async function initGSAP() {
  try {
    await ensureGSAPLoaded();
    await handleGlobalAnimation();
  } catch (error) {
    handleError(error, 'GSAP Initialization');
  }
}

export function getDefaultEase(name = 'tokenz-default') {
  return window.CustomEase && window.CustomEase.create
    ? window.CustomEase.create(name, 'M0,0 C0.22,0.6 0.36,1 1,1')
    : 'cubic-bezier(.22,.6,.36,1)';
}

/**
 * Handle Global Animations
 * Sets up all GSAP animations for the page
 * Prevents duplicate initialization
 */
export async function handleGlobalAnimation() {
  // Prevent duplicate initialization
  if (animationsInitialized) {
    return;
  }

  // Ensure GSAP is loaded before proceeding
  try {
    await ensureGSAPLoaded();
  } catch (error) {
    handleError(error, 'GSAP Global Animation');
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Shared Animation Configurations
  const defaultEase =
    window.CustomEase && window.CustomEase.create
      ? window.CustomEase.create('tokenz-default', 'M0,0 C0.22,0.6 0.36,1 1,1')
      : 'cubic-bezier(.22,.6,.36,1)';
  const defaultConfig = {
    duration: 0.75,
    ease: defaultEase,
  };

  // Utility to setup GSAP ScrollTrigger animations
  function setupScrollTrigger(elements, animationSettings, triggerSettings) {
    elements.forEach((element) => {
      gsap.fromTo(element, animationSettings.from, {
        ...animationSettings.to,
        scrollTrigger: {
          trigger: element,
          ...triggerSettings,
        },
      });
    });
  }

  // Scale Animation
  function applyScaleAnimation() {
    const elements = document.querySelectorAll('[anim-scale]');
    if (elements.length === 0) return;

    setupScrollTrigger(
      elements,
      { from: { scale: 1.1 }, to: { scale: 1, duration: 1.5 } },
      { start: 'top 95%' }
    );
  }

  // Stagger Animation
  function applyStaggerAnimation() {
    const staggerElements = document.querySelectorAll('[anim-stagger]:not([modal] [anim-stagger])');
    if (staggerElements.length === 0) return;

    staggerElements.forEach((element) => {
      const childrenSelector = element.getAttribute('anim-stagger');
      const children = element.querySelectorAll(childrenSelector);

      if (children.length === 0) return;

      gsap.set(children, {
        y: element.getAttribute('from-y') || '0.75rem',
        opacity: 0,
      });

      ScrollTrigger.batch(children, {
        onEnter: (target) => {
          gsap.to(target, {
            autoAlpha: 1,
            duration: element.getAttribute('data-duration') || defaultConfig.duration,
            y: '0rem',
            opacity: 1,
            stagger: {
              from: element.getAttribute('stagger-from') || 'start',
              each: element.getAttribute('stagger-amount') || 0.1,
            },
            ease: element.getAttribute('data-easing') || defaultConfig.ease,
            scrollTrigger: {
              trigger: element,
              start: element.getAttribute('scrollTrigger-start') || 'top 95%',
              markers: element.getAttribute('anim-markers') || false,
            },
            delay: element.getAttribute('data-delay') || 0.25,
            clearProps: 'all',
          });
        },
      });
    });
  }

  // General Element Animation
  function applyElementAnimation() {
    const elements = document.querySelectorAll(
      '[anim-element]:not([modal] [anim-element]), .anim-element:not([modal] .anim-element)'
    );
    if (elements.length === 0) return;

    elements.forEach((element) => {
      const fromConfig = {
        y: element.getAttribute('from-y') || '1.75rem',
        x: element.getAttribute('from-x') || 0,
        filter: `blur(6px)`,
        opacity: 0,
        scale: 0.98,
      };

      const toConfig = {
        y: '0%',
        x: '0%',
        opacity: 1,
        filter: 'blur(0px)',
        duration: element.getAttribute('data-duration') || defaultConfig.duration,
        ease: element.getAttribute('data-easing') || defaultConfig.ease,
        delay: element.getAttribute('data-delay') || 0.25,
        scale: 1,
        clearProps: 'all',
      };

      setupScrollTrigger([element], { from: fromConfig, to: toConfig }, { start: 'top 97%' });
    });
  }

  // Parallax Animation
  function applyParallaxAnimation() {
    if (window.innerWidth <= 768) return;

    const elements = document.querySelectorAll('[parallax-element]');
    if (elements.length === 0) return;

    setupScrollTrigger(
      elements,
      { from: { y: '-10%', scale: 1.1 }, to: { y: '10%', scale: 1.1 } },
      { start: 'top bottom', end: 'bottom -50%', scrub: 0.2 }
    );
  }

  // Background Lines Animation
  function applyBackgroundLinesAnimation() {
    const lines = document.querySelectorAll('.bg-lines .bg-line');
    if (lines.length === 0) return;

    setupScrollTrigger(
      lines,
      { from: { y: 400 }, to: { y: -100, duration: 2 } },
      { start: 'top bottom', end: 'bottom top', scrub: 1 }
    );
  }

  // SplitText Animation (text splitting only; animations can be added separately)
  async function applySplitTextAnimation() {
    const elements = document.querySelectorAll('[data-split-text]');
    if (elements.length === 0) return;

    const loaded = await loadSplitText();
    if (!loaded || typeof window.SplitText === 'undefined') {
      // Loader already logged the reason; skip to avoid runtime errors.
      return;
    }

    const splitTypeMap = {
      char: 'chars',
      chars: 'chars',
      word: 'words',
      words: 'words',
      line: 'lines',
      lines: 'lines',
    };

    let initialWindowWidth = window.innerWidth;
    let activeSplits = [];

    const cleanup = () => {
      // Remove any previously added line wrappers.
      document.querySelectorAll('.line-wrap').forEach((wrap) => {
        while (wrap.firstChild) {
          wrap.parentNode.insertBefore(wrap.firstChild, wrap);
        }
        wrap.remove();
      });

      // Revert SplitText instances to restore original DOM before re-splitting.
      activeSplits.forEach((split) => split?.revert?.());
      activeSplits = [];
    };

    const splitText = () => {
      cleanup();

      document.querySelectorAll('[data-split-text]').forEach((element) => {
        const attrValue = (element.getAttribute('data-split-text') || '').trim().toLowerCase();
        const splitKey = splitTypeMap[attrValue];

        if (!splitKey) {
          logger.warn(
            `[SplitText] Invalid data-split-text value "${attrValue}". Use "char", "word", or "line".`,
            element
          );
          return;
        }

        const split = new window.SplitText(element, { type: splitKey });
        activeSplits.push(split);

        // Add semantic classes to split parts
        if (split.chars && Array.isArray(split.chars) && splitKey === 'chars') {
          split.chars.forEach((node) => node.classList?.add('char'));
        }
        if (split.words && Array.isArray(split.words) && splitKey === 'words') {
          split.words.forEach((node) => node.classList?.add('word'));
        }

        // Only wrap lines; leave chars/words untouched.
        if (splitKey === 'lines' && Array.isArray(split.lines)) {
          split.lines.forEach((lineNode) => {
            lineNode.classList?.add('line');
            const wrap = document.createElement('div');
            wrap.classList.add('line-wrap');
            lineNode.parentNode.insertBefore(wrap, lineNode);
            wrap.appendChild(lineNode);
          });
        }
      });
    };

    splitText();
    window.addEventListener('resize', () => {
      if (window.innerWidth !== initialWindowWidth) {
        splitText();
        initialWindowWidth = window.innerWidth;
      }
    });
  }

  function subRiseAnimation() {
    const elements = document.querySelectorAll('.bg-sunrise.animate');
    if (elements.length === 0) return;

    elements.forEach((element) => {
      gsap.fromTo(
        element,
        { yPercent: 100 },
        { yPercent: 0, duration: 3.5, scrollTrigger: { trigger: element, start: 'top 95%' } }
      );
    });
  }

  // Content Divider Animation
  function applyContentDividerAnimation() {
    const contentDividers = document.querySelectorAll('.content-divider');
    if (contentDividers.length === 0) return;

    contentDividers.forEach((contentDivider) => {
      observeInView(
        contentDivider,
        (element) => {
          element.classList.add('animate');
        },
        { once: true }
      );
    });
  }

  // Numbers Counter Animation
  function applyCounterAnimation() {
    const counters = document.querySelectorAll('[counter-anim]:not([modal] [counter-anim])');
    if (!counters.length) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const easeOutQuad = (t) => t * (2 - t);

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          obs.unobserve(el);
          if (el.getAttribute('data-counter-animated') === 'true') return;
          el.setAttribute('data-counter-animated', 'true');

          const text = el.textContent || '';
          const match = text.match(/(\d[\d.,]*)/);
          if (!match) return;

          const originalNumberToken = match[0];
          const numStr = originalNumberToken.replace(/,/g, '');
          const target = Number.parseFloat(numStr);
          if (!Number.isFinite(target)) return;

          const decimals = (numStr.split('.')[1] || '').length;
          const useCommas = originalNumberToken.includes(',');

          const setValue = (value) => {
            const formatted = useCommas
              ? value.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })
              : value.toFixed(decimals);
            el.textContent = text.replace(originalNumberToken, formatted);
          };

          if (prefersReducedMotion) {
            setValue(target);
            return;
          }

          const duration = Number.parseInt(el.getAttribute('counter-duration') || '', 10) || 1000;
          let startTime = null;

          const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = easeOutQuad(progress);
            setValue(eased * target);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  // Apply all animations
  applyScaleAnimation();
  applyStaggerAnimation();
  applyElementAnimation();
  applyParallaxAnimation();
  applyBackgroundLinesAnimation();
  await applySplitTextAnimation();
  await subRiseAnimation();
  applyContentDividerAnimation();
  applyCounterAnimation();
  // Mark as initialized to prevent duplicates
  animationsInitialized = true;
}

/**
 * Create custom GSAP animation
 * Use this for custom animations in your page code
 *
 * @param {string|HTMLElement} target - Element or selector
 * @param {Object} vars - GSAP animation properties
 * @returns {Object} - GSAP animation
 */
export async function animate(target, vars) {
  await ensureGSAPLoaded();
  return window.gsap.to(target, vars);
}

/**
 * Create GSAP timeline
 * Use this for complex animation sequences
 *
 * @param {Object} vars - Timeline configuration
 * @returns {Object} - GSAP timeline
 */
export async function createTimeline(vars = {}) {
  await ensureGSAPLoaded();
  return window.gsap.timeline(vars);
}

/**
 * Create ScrollTrigger animation
 * Use this for custom scroll-based animations
 *
 * @param {Object} config - ScrollTrigger configuration
 * @returns {Object} - ScrollTrigger instance
 */
export async function createScrollTrigger(config) {
  await ensureGSAPLoaded();
  return window.ScrollTrigger.create(config);
}

/**
 * Refresh ScrollTrigger
 * Call this after DOM changes or layout shifts
 */
export function refreshScrollTrigger() {
  if (scrollTriggerLoaded && typeof window.ScrollTrigger !== 'undefined') {
    window.ScrollTrigger.refresh();
  }
}

/**
 * Get GSAP instance
 * @returns {Object|null} - GSAP object
 */
export function getGSAP() {
  return gsapLoaded && typeof window.gsap !== 'undefined' ? window.gsap : null;
}

/**
 * Get ScrollTrigger instance
 * @returns {Object|null} - ScrollTrigger object
 */
export function getScrollTrigger() {
  return scrollTriggerLoaded && typeof window.ScrollTrigger !== 'undefined'
    ? window.ScrollTrigger
    : null;
}

/**
 * Kill all ScrollTrigger instances (cleanup)
 */
export function killAllScrollTriggers() {
  if (scrollTriggerLoaded && typeof window.ScrollTrigger !== 'undefined') {
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
