/**
 * Swiper Carousel Component (Shared Utility)
 * Lazy-loads Swiper via jsDelivr and initializes sliders only when they approach the viewport.
 * Not global: import only on pages that render Swiper sliders.
 *
 * Quick start:
 * 1) Import: import { initSwiper, destroySwipers, getSwiperInstance } from '../components/swiper';
 * 2) Markup:
 *    <div swiper-slider data-space="24" data-sync="hero-slider">
 *      <div class="swiper">
 *        <div class="swiper-wrapper">
 *          <div class="swiper-slide">Slide 1</div>
 *        </div>
 *        <div class="swiper-pagination"></div>
 *      </div>
 *      <button swiper-prev-btn>Prev</button>
 *      <button swiper-next-btn>Next</button>
 *      <div class="swiper-progress-bar"><div class="swiper-progress-fill"></div></div>
 *    </div>
 * 3) Call initSwiper() once after DOM ready; sliders load when they are near viewport (IntersectionObserver).
 *
 * Options on [swiper-slider]:
 * - data-space / data-space-mobile: gutter size (defaults 24 / 10).
 * - data-center / data-center-bounds: center slides.
 * - data-click-center: click a slide to center it.
 * - data-sync="groupId": sync multiple sliders together.
 *
 * Notes:
 * - Uses delegated keyboard nav + custom progress bar updates.
 * - destroySwipers() cleans up if you need to reinitialize on page transitions.
 */

import { safeParseInt, handleError } from '../utils/helpers';
import { loadLibrary, isLibraryLoaded } from '../utils/jsdelivr';
import { logger } from '../utils/logger';

let swiperLibraryLoaded = false;
let loadPromise = null;
let pendingSliders = [];
const syncedSliderGroups = new Map();

/**
 * Load Swiper library from CDN
 * Performance optimized: Uses Promise-based approach instead of polling
 */
async function loadSwiperLibrary() {
  if (swiperLibraryLoaded || isLibraryLoaded('swiper')) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Create a single promise for the load operation
  loadPromise = (async () => {
    try {
      // Load CSS and JS via jsDelivr utility
      await loadLibrary('swiper');

      if (typeof Swiper === 'undefined') {
        throw new Error('Swiper library failed to load');
      }

      swiperLibraryLoaded = true;

      // Initialize any pending sliders
      if (pendingSliders.length > 0) {
        logger.log(`Initializing ${pendingSliders.length} pending slider(s)...`);
        initializeSwipers(pendingSliders);
        pendingSliders = [];
      }

      return true;
    } catch (error) {
      handleError(error, 'Swiper Library Loader');
      loadPromise = null; // Reset on error to allow retry
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Load and initialize a specific slider
 */
async function loadAndInitSlider(slider) {
  // Add slider to pending queue
  if (!swiperLibraryLoaded && !pendingSliders.includes(slider)) {
    pendingSliders.push(slider);
  }

  // Load library if not loaded
  if (!swiperLibraryLoaded) {
    await loadSwiperLibrary();
  }

  // If library is loaded but slider wasn't initialized yet
  if (swiperLibraryLoaded && !slider._swiperInitialized) {
    initializeSwipers([slider]);
  }
}

/**
 * Initialize Swiper carousels (Performance Optimized!)
 * Uses Intersection Observer to load only when slider is near viewport
 */
export function initSwiper() {
  // Check if any swiper elements exist
  const sliders = document.querySelectorAll('[swiper-slider]');
  if (!sliders.length) return;

  logger.log(`⏳ Found ${sliders.length} slider(s) - will load when visible...`);

  // Create Intersection Observer to detect when slider is near viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slider = entry.target;

          // Stop observing this slider
          observer.unobserve(slider);

          // Mark as observed
          slider.setAttribute('data-swiper-observed', 'true');

          // Load and initialize
          loadAndInitSlider(slider);
        }
      });
    },
    {
      root: null,
      rootMargin: '200px', // Start loading 200px before slider enters viewport
      threshold: 0,
    }
  );

  // Observe all sliders
  sliders.forEach((slider) => {
    observer.observe(slider);
  });
}

/**
 * Initialize specific Swiper instances
 * @param {Array|NodeList} sliderList - List of slider elements to initialize
 */
function initializeSwipers(sliderList) {
  if (!sliderList || !sliderList.length) return;
  sliderList.forEach((slider) => {
    // Skip if already initialized
    if (slider._swiperInitialized) return;
    slider._swiperInitialized = true;
    const swiperContainer = slider.querySelector('.swiper');
    if (!swiperContainer) {
      logger.warn('Swiper container not found in slider:', slider);
      return;
    }

    // Get elements
    const nextBtn = slider.querySelector('[swiper-next-btn]');
    const prevBtn = slider.querySelector('[swiper-prev-btn]');
    const paginationEl = swiperContainer.querySelector('.swiper-pagination');
    const customProgressBar = slider.querySelector('.swiper-progress-bar');
    const syncId = slider.getAttribute('data-sync');

    // Parse spacing attributes with safe defaults
    const spaceDesktop = safeParseInt(slider.getAttribute('data-space'), 24);
    const spaceMobile = safeParseInt(slider.getAttribute('data-space-mobile'), 10);

    // Center mode options
    const centerMode = slider.hasAttribute('data-center');
    const centerBounds = slider.hasAttribute('data-center-bounds');
    const clickToCenter = slider.hasAttribute('data-click-center');
    const loopMode = slider.hasAttribute('data-loop');
    const disableDrag = slider.hasAttribute('data-no-drag');

    // Update button states
    function updateButtonStates(swiper) {
      const bothDisabled = swiper.isBeginning && swiper.isEnd;

      if (prevBtn) {
        prevBtn.style.pointerEvents = swiper.isBeginning ? 'none' : 'auto';
        prevBtn.style.opacity = swiper.isBeginning ? '0.5' : '1';
        prevBtn.style.display = bothDisabled ? 'none' : '';
        prevBtn.setAttribute('aria-disabled', String(swiper.isBeginning));
      }
      if (nextBtn) {
        nextBtn.style.pointerEvents = swiper.isEnd ? 'none' : 'auto';
        nextBtn.style.opacity = swiper.isEnd ? '0.5' : '1';
        nextBtn.style.display = bothDisabled ? 'none' : '';
        nextBtn.setAttribute('aria-disabled', String(swiper.isEnd));
      }
    }

    // Update custom progress bar
    function updateCustomProgressBar(swiper) {
      if (!customProgressBar) return;

      const slides = swiper.slides;
      let totalSlides = slides.length;
      let currentIndex = swiper.activeIndex;

      // Handle loop mode - filter out duplicate slides
      if (swiper.params.loop) {
        const realSlides = swiper.slides.filter(
          (slide) => !slide.classList.contains('swiper-slide-duplicate')
        );
        totalSlides = realSlides.length;
        currentIndex = swiper.realIndex;
      }

      let progress = 0;

      // For slidesPerView: 'auto', calculate based on scroll position
      if (swiper.params.slidesPerView === 'auto') {
        const maxTranslate = swiper.maxTranslate();
        const currentTranslate = swiper.translate;
        progress = totalSlides > 1 ? Math.abs(currentTranslate / maxTranslate) * 100 : 0;
      } else {
        // Standard calculation for fixed slidesPerView
        progress = totalSlides > 1 ? (currentIndex / (totalSlides - 1)) * 100 : 0;
      }

      // Update UI
      updateProgressBarUI(progress, currentIndex, totalSlides);

      function updateProgressBarUI(prog, currentIdx, totalCount) {
        const progressFill = customProgressBar.querySelector('.swiper-progress-fill');

        if (progressFill) {
          progressFill.style.width = `${Math.max(0, Math.min(100, prog))}%`;
          customProgressBar.setAttribute('data-progress', prog.toFixed(1));
          customProgressBar.setAttribute('data-current-slide', currentIdx + 1);
          customProgressBar.setAttribute('data-total-slides', totalCount);
        }
      }
    }

    // Build Swiper configuration
    const swiperConfig = {
      slidesPerView: 'auto',
      spaceBetween: spaceDesktop,
      grabCursor: true,
      speed: 700,
      watchOverflow: true,

      // Center mode (opt-in)
      centeredSlides: centerMode,
      centeredSlidesBounds: centerBounds,
      slideToClickedSlide: centerMode || clickToCenter,

      // Looping
      loop: loopMode,

      // Interaction
      allowTouchMove: !disableDrag,

      // Navigation
      navigation:
        nextBtn || prevBtn
          ? {
            nextEl: nextBtn,
            prevEl: prevBtn,
          }
          : false,

      // Pagination (only if element exists)
      pagination: paginationEl
        ? {
          el: paginationEl,
          type: 'progressbar',
          progressbarFillClass: 'swiper-pagination-progressbar-fill',
        }
        : false,

      // Responsive breakpoints
      breakpoints: {
        0: { spaceBetween: spaceMobile },
        768: { spaceBetween: spaceDesktop },
      },

      // Event callbacks
      on: {
        init() {
          updateButtonStates(this);
          updateCustomProgressBar(this);
          if (paginationEl) {
            paginationEl.style.display = 'block';
          }
        },
        slideChange() {
          updateButtonStates(this);
          updateCustomProgressBar(this);
        },
        slideChangeTransitionEnd() {
          updateButtonStates(this);
          updateCustomProgressBar(this);
        },
        reachBeginning() {
          updateButtonStates(this);
        },
        reachEnd() {
          updateButtonStates(this);
        },
        resize() {
          updateButtonStates(this);
          updateCustomProgressBar(this);
        },
        update() {
          updateButtonStates(this);
          updateCustomProgressBar(this);
        },
        progress(swiper, progress) {
          // Real-time progress during scroll/drag
          if (customProgressBar) {
            const progressPercentage = progress * 100;
            const progressFill = customProgressBar.querySelector('.swiper-progress-fill');
            if (progressFill) {
              progressFill.style.width = `${progressPercentage}%`;
              customProgressBar.setAttribute('data-progress', progressPercentage.toFixed(1));
            }
          }
        },
      },
    };

    try {
      const swiperInstance = new Swiper(swiperContainer, swiperConfig);

      // Store instance for external access
      swiperContainer._swiper = swiperInstance;

      registerSyncedSlider(syncId, swiperInstance);

      // Add accessibility attributes
      if (nextBtn) {
        nextBtn.setAttribute('aria-label', 'Next slide');
        nextBtn.setAttribute('role', 'button');
      }
      if (prevBtn) {
        prevBtn.setAttribute('aria-label', 'Previous slide');
        prevBtn.setAttribute('role', 'button');
      }

      // Add aria-live region for screen readers
      swiperContainer.setAttribute('aria-live', 'polite');
      swiperContainer.setAttribute('aria-atomic', 'false');

      // Keyboard navigation (performance optimized with event delegation)
      if (!slider._keyboardSetup) {
        const keyboardHandler = (e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            swiperInstance.slideNext();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            swiperInstance.slidePrev();
          }
        };

        slider.addEventListener('keydown', keyboardHandler);
        slider.tabIndex = 0; // Make focusable
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Carousel');
        slider._keyboardSetup = true;
      }
    } catch (error) {
      handleError(error, 'Swiper Initialization');
    }
  });

  logger.log(`✅ ${sliderList.length} Swiper carousel(s) initialized`);
}

/**
 * Get Swiper instance from container
 * @param {string|HTMLElement} selector - Swiper container selector or element
 * @returns {Object|null} - Swiper instance
 */
export function getSwiperInstance(selector) {
  const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
  return container?._swiper || null;
}

/**
 * Destroy all Swiper instances (cleanup)
 */
export function destroySwipers() {
  document.querySelectorAll('.swiper').forEach((container) => {
    if (container._swiper) {
      container._swiper.destroy(true, true);
      if (container._keyboardCleanup) {
        container._keyboardCleanup();
      }
    }
  });
  syncedSliderGroups.clear();
}

/**
 * Register a swiper instance inside a sync group
 * @param {string|null} syncId
 * @param {Object} swiperInstance
 */
function registerSyncedSlider(syncId, swiperInstance) {
  if (!syncId || !swiperInstance) return;

  if (!syncedSliderGroups.has(syncId)) {
    syncedSliderGroups.set(syncId, new Set());
  }

  const group = syncedSliderGroups.get(syncId);
  group.add(swiperInstance);

  const syncHandler = function () {
    const targetIndex = this.params.loop ? this.realIndex : this.activeIndex;
    group.forEach((otherSwiper) => {
      if (otherSwiper === this || otherSwiper.destroyed) return;
      const goTo =
        otherSwiper.params.loop && typeof otherSwiper.slideToLoop === 'function'
          ? otherSwiper.slideToLoop
          : otherSwiper.slideTo;
      goTo.call(otherSwiper, targetIndex);
    });
  };

  swiperInstance.on('slideChange', syncHandler);

  swiperInstance.on('destroy', () => {
    swiperInstance.off('slideChange', syncHandler);
    group.delete(swiperInstance);
    if (group.size === 0) {
      syncedSliderGroups.delete(syncId);
    }
  });
}
