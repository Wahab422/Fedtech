import { logger } from '../utils/logger';

/**
 * Lenis Smooth Scroll
 * Premium smooth scroll library for buttery-smooth scrolling
 * Only runs on scroll devices (desktop with mouse/trackpad). Touch devices use native scroll.
 * Performance optimized: Loads only on first user interaction
 * Documentation: https://github.com/studio-freight/lenis
 */

let lenis = null;
let lenisLoaded = false;
let lenisImport = null;
let paginationRefreshScheduled = false;

/** True when we never load Lenis (touch devices); use native scroll only */
let useNativeScrollOnly = false;

/**
 * Detect if the device is a "scroll device" (mouse/trackpad) vs touch (mobile, tablet).
 * Lenis runs only on scroll devices; touch devices use native scroll.
 * @returns {boolean} true = desktop with precise pointer and hover (use Lenis)
 */
function isScrollDevice() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Native scroll to element (used on touch devices and when Lenis is not available)
 */
function nativeScrollTo(target, offset = 0, behavior = 'smooth') {
  if (typeof window === 'undefined' || !target) return;
  const navbar = document.querySelector('.nav') || document.querySelector('[data-navbar]');
  const offsetPx = (navbar ? navbar.offsetHeight : 0) + offset;
  const top = target.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.scrollTo({ top, behavior });
}

/**
 * Set up anchor and data-scroll-to handlers using native scroll (for touch devices)
 */
function initNativeScrollHandlers() {
  // Anchor links: smooth scroll to #section
  document.addEventListener(
    'click',
    (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        nativeScrollTo(target, 0);
      }
    },
    { passive: false }
  );

  // data-scroll-to buttons
  document.addEventListener(
    'click',
    (e) => {
      const button = e.target.closest('[data-scroll-to]');
      if (!button) return;
      e.preventDefault();
      const target = button.getAttribute('data-scroll-to');
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'bottom') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else if (target.startsWith('#')) {
        const element = document.querySelector(target);
        if (element) nativeScrollTo(element, 0);
      }
    },
    { passive: false }
  );

  // Pagination / layout changes: refresh ScrollTrigger only
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;
    const shouldRefresh = target.closest('.w-pagination-next') || target.closest('.w-radio');
    if (!shouldRefresh) return;
    if (paginationRefreshScheduled) return;
    paginationRefreshScheduled = true;
    requestAnimationFrame(() => {
      paginationRefreshScheduled = false;
      if (window.ScrollTrigger?.refresh) window.ScrollTrigger.refresh();
    });
    setTimeout(() => {
      if (window.ScrollTrigger?.refresh) window.ScrollTrigger.refresh();
    }, 150);
  });
}

/**
 * Actually initialize Lenis (called after first interaction, scroll devices only)
 */
async function actuallyInitLenis() {
  if (lenisLoaded) return;
  lenisLoaded = true;

  try {
    // Dynamically import Lenis only when needed
    const { default: Lenis } = await import('@studio-freight/lenis');
    logger.log('🎯 Lenis smooth scroll loading...');

    // Create Lenis instance with optimized configuration
    lenis = new Lenis({
      duration: 1.2, // Animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
      orientation: 'vertical', // 'vertical' or 'horizontal'
      gestureOrientation: 'vertical', // 'vertical', 'horizontal', or 'both'
      smoothWheel: true, // Enable smooth scrolling for mouse wheel
      wheelMultiplier: 1, // Mouse wheel sensitivity
      smoothTouch: false, // Disabled for better mobile performance
      touchMultiplier: 2, // Touch sensitivity
      infinite: false, // Infinite scrolling
      autoResize: true, // Auto resize on window resize
      lerp: 0.1, // Lower = smoother but slower, higher = faster but less smooth
    });

    // RAF loop for Lenis
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    logger.log('✅ Lenis smooth scroll ready');

    const scheduleScrollRefresh = () => {
      if (paginationRefreshScheduled) return;
      paginationRefreshScheduled = true;

      const refresh = () => {
        if (lenis?.resize) lenis.resize();
        if (window.ScrollTrigger?.refresh) window.ScrollTrigger.refresh();
      };

      requestAnimationFrame(() => {
        paginationRefreshScheduled = false;
        refresh();
      });

      // Follow-up refresh for async content insertion.
      setTimeout(refresh, 250);
    };

    // Handle anchor links (Performance optimized with event delegation)
    document.addEventListener(
      'click',
      (e) => {
        if (!lenis) return;
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');

        // Skip empty anchors
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          // Get navbar height for offset (cached if navbar exists)
          const navbar = document.querySelector('.nav');
          const offset = navbar ? navbar.offsetHeight : 0;

          // Scroll to target with Lenis
          lenis.scrollTo(target, {
            offset: -offset,
            duration: 1.2,
          });
        }
      },
      { passive: false } // Can't be passive because we preventDefault
    );

    // Handle Webflow pagination "next" clicks (refresh Lenis + ScrollTrigger)
    // and Webflow checkbox interactions which can change layout.
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      const shouldRefresh = target.closest('.w-pagination-next') || target.closest('.w-radio');
      if (!shouldRefresh) return;
      scheduleScrollRefresh();
    });

    // Handle data-scroll-to buttons (Performance optimized with event delegation)
    document.addEventListener(
      'click',
      (e) => {
        if (!lenis) return;
        const button = e.target.closest('[data-scroll-to]');
        if (!button) return;

        e.preventDefault();
        const target = button.getAttribute('data-scroll-to');

        if (target === 'top') {
          lenis.scrollTo(0, { duration: 1.2 });
        } else if (target === 'bottom') {
          lenis.scrollTo(document.body.scrollHeight, { duration: 1.5 });
        } else if (target.startsWith('#')) {
          const element = document.querySelector(target);
          if (element) {
            const navbar = document.querySelector('[data-navbar]');
            const offset = navbar ? navbar.offsetHeight : 0;
            lenis.scrollTo(element, {
              offset: -offset,
              duration: 1.2,
            });
          }
        }
      },
      { passive: false } // Can't be passive because we preventDefault
    );
  } catch (error) {
    logger.error('Error loading Lenis:', error);
  }
}

/**
 * Initialize Lenis on first user interaction (scroll devices only).
 * On touch devices (mobile, tablet), uses native scroll and never loads Lenis.
 */
export function initLenis() {
  if (lenisImport) return; // Already set up

  if (!isScrollDevice()) {
    useNativeScrollOnly = true;
    logger.log('📱 Touch device detected — using native scroll (Lenis disabled)');
    initNativeScrollHandlers();
    lenisImport = true;
    return;
  }

  logger.log('⏳ Lenis will load on first interaction...');

  // List of events that indicate user interaction
  const interactionEvents = ['scroll', 'wheel', 'touchstart', 'click', 'mousemove'];
  let hasInteracted = false;

  const loadOnInteraction = () => {
    if (hasInteracted) return;
    hasInteracted = true;

    // Remove all listeners
    interactionEvents.forEach((event) => {
      window.removeEventListener(event, loadOnInteraction, { passive: true });
    });

    // Load Lenis
    actuallyInitLenis();
  };

  // Add listeners for first interaction
  interactionEvents.forEach((event) => {
    window.addEventListener(event, loadOnInteraction, { passive: true, once: true });
  });

  lenisImport = true;
}

/**
 * Get the Lenis instance
 * @returns {Lenis} The Lenis instance
 */
export function getLenis() {
  return lenis;
}

/**
 * Scroll to a specific element
 * @param {string|HTMLElement} target - The target element or selector
 * @param {Object} options - Lenis scroll options
 */
export function scrollTo(target, options = {}) {
  if (!lenis) {
    logger.warn('Lenis is not initialized');
    return;
  }

  const element = typeof target === 'string' ? document.querySelector(target) : target;

  if (element) {
    const navbar = document.querySelector('[data-navbar]');
    const defaultOffset = navbar ? -navbar.offsetHeight : 0;

    lenis.scrollTo(element, {
      offset: defaultOffset,
      duration: 1.2,
      ...options,
    });
  }
}

/**
 * Scroll to top
 */
export function scrollToTop() {
  if (!lenis) {
    logger.warn('Lenis is not initialized');
    return;
  }
  lenis.scrollTo(0, { duration: 1.2 });
}

/**
 * Scroll to bottom
 */
export function scrollToBottom() {
  if (!lenis) {
    logger.warn('Lenis is not initialized');
    return;
  }
  lenis.scrollTo(document.body.scrollHeight, { duration: 1.5 });
}

/**
 * Stop/Start Lenis
 * Useful for modals or when you need to disable scrolling
 */
export function stopLenis() {
  if (lenis) lenis.stop();
}

export function startLenis() {
  if (lenis) lenis.start();
}

/**
 * Handle URL hash fragments on page load
 * Scrolls to the element specified in the URL hash with offset
 */
function handleUrlHash() {
  const hash = window.location.hash;

  // Skip if no hash or empty hash
  if (!hash || hash === '#' || hash === '#!') return;

  // Find the target element
  const target = document.querySelector(hash);
  if (!target) {
    logger.warn(`[Lenis] Element not found for hash: ${hash}`);
    return;
  }

  // Function to scroll to hash element
  const scrollToHash = () => {
    if (!lenis) {
      logger.warn('[Lenis] Cannot scroll to hash - Lenis not initialized');
      return;
    }

    // Get navbar height for offset
    const navbar = document.querySelector('.nav');
    const offset = navbar ? navbar.offsetHeight : 0;

    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
      lenis.scrollTo(target, {
        offset: -offset,
        duration: 1.2,
      });
      logger.log(`[Lenis] Scrolled to hash element: ${hash}`);
    }, 100);
  };

  // Touch devices: use native scroll immediately
  if (useNativeScrollOnly) {
    const navbar = document.querySelector('.nav') || document.querySelector('[data-navbar]');
    const offset = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    return;
  }

  // If Lenis is already loaded, scroll immediately
  if (lenis && lenisLoaded) {
    scrollToHash();
    return;
  }

  // Otherwise, wait for Lenis to initialize
  // Check every 100ms for up to 5 seconds
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait

  const checkLenis = setInterval(() => {
    attempts++;

    if (lenis && lenisLoaded) {
      clearInterval(checkLenis);
      scrollToHash();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkLenis);
      logger.warn('[Lenis] Timeout waiting for Lenis to initialize for hash scroll');
      // Fallback to native scroll
      const navbar = document.querySelector('[data-navbar]');
      const offset = navbar ? navbar.offsetHeight : 0;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }, 100);
}

/**
 * Initialize URL hash handling
 * Should be called on page load
 */
export function initUrlHash() {
  // Handle hash on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleUrlHash);
  } else {
    handleUrlHash();
  }

  // Also handle hash changes (e.g., when navigating with browser back/forward)
  window.addEventListener('hashchange', handleUrlHash);
}
