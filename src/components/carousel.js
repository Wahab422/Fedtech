/**
 * Carousel Component (Shared Utility)
 * Lazy-loads the carousel library via jsDelivr and initializes sliders only when they approach the viewport.
 * Not global: import only on pages that render carousels.
 *
 * Quick start:
 * 1) Import: import { initCarousel, destroyCarousels, getCarouselInstance } from '../components/carousel';
 * 2) Markup:
 *    <div data-carousel data-sync="hero-slider">
 *      <div carousel-wrapper>
 *        <div carousel>
 *          <div>Slide 1</div>
 *          <div>Slide 2</div>
 *          <div>Slide 3</div>
 *        </div>
 *      </div>
 *      <div carousel-btns>
 *        <button carousel-prev-btn type="button" class="btn" aria-label="Previous slide">Prev</button>
 *        <button carousel-next-btn type="button" class="btn" aria-label="Next slide">Next</button>
 *      </div>
 *      <!-- OR fallback: two generic [carousel-btn] inside [carousel-btns] (first = prev, second = next) -->
 *      <div carousel-dots></div>
 *      <div carousel-progress-bar><div class="carousel-progress-fill"></div></div>
 *    </div>
 * 3) Call initCarousel() once after DOM ready; sliders load when they are near viewport.
 *
 * Options on [data-carousel]:
 * - data-align="start|center|end": slide alignment (default "start").
 * - data-center: shorthand for align="center".
 * - data-center-bounds: contain snaps when centered.
 * - data-click-center: click a slide to scroll into view.
 * - data-loop: loop slides.
 * - data-no-drag: disable drag interaction.
 * - data-drag-free: allow free scrolling momentum.
 * - data-autoplay: auto-advance slides.
 * - data-autoplay-delay="4000": autoplay interval in ms (default 4000).
 * - data-autoplay-stop-on-interaction: stop autoplay after user interaction.
 * - data-fade: fade between slides (disables drag).
 * - data-effect="fade": alias for data-fade.
 * - data-carousel="fade": alias for data-fade.
 * - data-fade-duration="600": fade duration in ms (default 650).
 * - data-fade-ease="cubic-bezier(0.22, 1, 0.36, 1)": easing (default ease-out).
 * - data-slide-btn: add to any button to jump to a slide (order-based, or use data-slide-index="0" for explicit index).
 * - [carousel-dots] / .carousel-dots: auto-generate dot buttons (optional).
 * - data-sync="groupId": sync multiple sliders together.
 * - data-slide-classes: enable is-active/is-passed/is-upcoming/is-prev/is-next classes.
 */

import { handleError } from '../utils/helpers';
import { loadLibrary, isLibraryLoaded } from '../utils/jsdelivr';
import { logger } from '../utils/logger';

let carouselLibraryLoaded = false;
let loadPromise = null;
let pendingSliders = [];
const syncedSliderGroups = new Map();
const VIEWPORT_SELECTOR = '.carousel-wrapper, [carousel-wrapper]';
const CONTAINER_SELECTOR = '.carousel, [carousel]';
const BTNS_WRAPPER_SELECTOR = '[carousel-btns], .carousel-btns, .arrow-btns';
const PREV_BTN_SELECTOR = '[carousel-prev-btn], .carousel-btns .btn[aria-label="Previous slide"]';
const NEXT_BTN_SELECTOR = '[carousel-next-btn], .carousel-btns .btn[aria-label="Next slide"]';
/**
 * Load carousel library from CDN
 */
async function loadCarouselLibrary() {
  if (carouselLibraryLoaded || isLibraryLoaded('embla')) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      await loadLibrary('embla', { loadCSS: false });

      if (typeof window.EmblaCarousel === 'undefined') {
        throw new Error('Carousel library failed to load');
      }

      carouselLibraryLoaded = true;

      if (pendingSliders.length > 0) {
        logger.log(`Initializing ${pendingSliders.length} pending carousel(s)...`);
        initializeCarousels(pendingSliders);
        pendingSliders = [];
      }

      return true;
    } catch (error) {
      handleError(error, 'Carousel Library Loader');
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Load and initialize a specific slider
 */
async function loadAndInitSlider(slider) {
  if (!carouselLibraryLoaded && !pendingSliders.includes(slider)) {
    pendingSliders.push(slider);
  }

  if (!carouselLibraryLoaded) {
    await loadCarouselLibrary();
  }

  if (carouselLibraryLoaded && !slider._carouselInitialized) {
    initializeCarousels([slider]);
  }
}

/**
 * Initialize carousels
 */
export function initCarousel() {
  const sliders = document.querySelectorAll('[data-carousel]');
  // #region agent log
  fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
    body: JSON.stringify({
      sessionId: 'bec643',
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'carousel.js:initCarousel',
      message: 'initCarousel invoked',
      data: { sliderCount: sliders.length },
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion
  if (!sliders.length) return;

  logger.log(`⏳ Found ${sliders.length} carousel(s) - will load when visible...`);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slider = entry.target;
          observer.unobserve(slider);
          slider.setAttribute('data-carousel-observed', 'true');
          loadAndInitSlider(slider);
        }
      });
    },
    {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    }
  );

  sliders.forEach((slider) => {
    observer.observe(slider);
  });
}

/**
 * Initialize specific carousel instances
 * @param {Array|NodeList} sliderList
 */
function initializeCarousels(sliderList) {
  if (!sliderList || !sliderList.length) return;

  sliderList.forEach((slider) => {
    // #region agent log
    fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
      body: JSON.stringify({
        sessionId: 'bec643',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'carousel.js:initializeCarousels:entry',
        message: 'slider init entry',
        data: {
          alreadyInitialized: Boolean(slider._carouselInitialized),
          hasObservedAttr: slider.hasAttribute('data-carousel-observed'),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => { });
    // #endregion
    if (slider._carouselInitialized) return;
    slider._carouselInitialized = true;

    const carouselRoot = slider.querySelector(VIEWPORT_SELECTOR) || slider;
    const carouselViewport = slider.querySelector(VIEWPORT_SELECTOR) || carouselRoot;
    const carouselContainer = slider.querySelector(CONTAINER_SELECTOR);

    if (!carouselViewport) {
      // #region agent log
      fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
        body: JSON.stringify({
          sessionId: 'bec643',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'carousel.js:initializeCarousels:missingViewport',
          message: 'missing viewport after initialized flag set',
          data: { initializedFlag: Boolean(slider._carouselInitialized) },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion
      logger.warn('Carousel viewport not found in slider:', slider);
      return;
    }

    const navButtonsWrapper = slider.querySelector(BTNS_WRAPPER_SELECTOR);
    const fallbackNavButtons = navButtonsWrapper
      ? Array.from(navButtonsWrapper.querySelectorAll('[carousel-btn], .arrow-btn, button'))
      : [];

    const explicitNextBtn =
      slider.querySelector('[slider-next-btn]') || slider.querySelector(NEXT_BTN_SELECTOR);
    const explicitPrevBtn =
      slider.querySelector('[slider-prev-btn]') || slider.querySelector(PREV_BTN_SELECTOR);

    const prevBtn = explicitPrevBtn || fallbackNavButtons[0] || null;
    let nextBtn =
      explicitNextBtn ||
      (fallbackNavButtons.length > 1 ? fallbackNavButtons[1] : fallbackNavButtons[0]) ||
      null;

    if (prevBtn && nextBtn && prevBtn === nextBtn) {
      // A single generic button cannot represent both directions.
      nextBtn = null;
    }
    let slideButtons = [];
    const customProgressBar = slider.querySelector('.carousel-progress-bar');
    const syncId = slider.getAttribute('data-sync');

    const centerMode = slider.hasAttribute('data-center');
    const centerBounds = slider.hasAttribute('data-center-bounds');
    const clickToCenter = slider.hasAttribute('data-click-center');
    const loopMode = slider.hasAttribute('data-loop');
    const disableDrag = slider.hasAttribute('data-no-drag');
    const dragFree = slider.hasAttribute('data-drag-free');
    const autoplayEnabled = slider.hasAttribute('data-autoplay');
    const autoplayStopOnInteraction = slider.hasAttribute('data-autoplay-stop-on-interaction');
    const fadeMode =
      slider.hasAttribute('data-fade') ||
      slider.getAttribute('data-effect') === 'fade' ||
      slider.getAttribute('data-carousel') === 'fade';
    const slideClassesEnabled = slider.hasAttribute('data-slide-classes');
    const alignAttr = slider.getAttribute('data-align');
    const autoplayDelayAttr = slider.getAttribute('data-autoplay-delay');
    const autoplayDelay = Number.isFinite(Number.parseInt(autoplayDelayAttr, 10))
      ? Number.parseInt(autoplayDelayAttr, 10)
      : 8000;
    const fadeDurationAttr = slider.getAttribute('data-fade-duration');
    const fadeDuration = Number.isFinite(Number.parseInt(fadeDurationAttr, 10))
      ? Math.max(150, Number.parseInt(fadeDurationAttr, 10))
      : 650;
    const fadeEase = slider.getAttribute('data-fade-ease') || 'cubic-bezier(0.22, 1, 0.36, 1)';

    const carouselOptions = {
      align: alignAttr || (centerMode ? 'center' : 'start'),
      containScroll: 'keepSnaps',
      loop: loopMode,
      draggable: fadeMode ? false : !disableDrag,
      dragFree: fadeMode ? false : dragFree
    };

    let carouselApi = null;
    let autoplayTimer = null;
    const cleanupTasks = [];
    let scrollToIndex = () => { };
    let restartAutoplay = null;
    let lastButtonStateKey = null;

    function getSlides() {
      if (carouselContainer) {
        return Array.from(carouselContainer.children);
      }
      return Array.from(slider.querySelectorAll('.carousel-item'));
    }

    function applyFadeLayout() {
      if (!fadeMode || !carouselContainer) return;
      const slides = getSlides();
      if (!slides.length) return;
      const maxHeight = slides.reduce((max, slide) => Math.max(max, slide.offsetHeight), 0);
      carouselViewport.style.overflow = 'hidden';
      carouselContainer.style.position = 'relative';
      carouselContainer.style.display = 'block';
      carouselContainer.style.transform = 'none';
      carouselContainer.style.transition = 'none';
      if (maxHeight > 0) {
        carouselContainer.style.height = `${maxHeight}px`;
      }
      slides.forEach((slide) => {
        slide.style.position = 'absolute';
        slide.style.inset = '0';
        slide.style.width = '100%';
        slide.style.willChange = 'opacity, transform';
        slide.style.backfaceVisibility = 'hidden';
        slide.style.transformOrigin = 'center center';
        slide.style.transition = `opacity ${fadeDuration}ms ${fadeEase}, transform ${Math.round(
          fadeDuration * 1.2
        )}ms ${fadeEase}`;
      });
    }

    function ensureDots() {
      const dotsContainer =
        slider.querySelector('[carousel-dots]') || slider.querySelector('.carousel-dots');

      const slides = getSlides();
      if (!slides.length) return;

      if (dotsContainer) {
        // Check if dots container already has buttons
        const existingDots = dotsContainer.querySelectorAll('[data-slide-btn]');

        if (existingDots.length > 0) {
          // Dots already exist, don't clear the container
          // But ensure we have the right number of dots
          if (existingDots.length !== slides.length) {
            logger.warn(
              `Carousel has ${slides.length} slides but ${existingDots.length} dot buttons. Button count should match slide count.`
            );
          }
        } else {
          // No dots exist, create them
          dotsContainer.innerHTML = '';
          const fragment = document.createDocumentFragment();
          slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('data-slide-btn', '');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            fragment.appendChild(dot);
          });
          dotsContainer.appendChild(fragment);
        }
      }

      // Collect all slide buttons after ensuring dots exist
      // This includes both manually added buttons and auto-generated dots
      slideButtons = Array.from(slider.querySelectorAll('[data-slide-btn]'));

      // Sort buttons by their position in DOM or by data-slide-index if specified
      slideButtons.sort((a, b) => {
        const aIndex = a.hasAttribute('data-slide-index')
          ? Number.parseInt(a.getAttribute('data-slide-index'), 10)
          : null;
        const bIndex = b.hasAttribute('data-slide-index')
          ? Number.parseInt(b.getAttribute('data-slide-index'), 10)
          : null;

        if (aIndex !== null && bIndex !== null) {
          return aIndex - bIndex;
        }
        if (aIndex !== null) return -1;
        if (bIndex !== null) return 1;

        // Fallback to DOM order
        const position = a.compareDocumentPosition(b);
        return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

      // Limit to number of slides (in case there are extra buttons)
      slideButtons = slideButtons.slice(0, slides.length);
    }

    function updateActiveSlides() {
      if (!carouselApi) return;
      const slides = getSlides();
      if (!slides.length) return;
      if (fadeMode) {
        if (!carouselContainer) {
          logger.warn('Fade mode requires a carousel container inside the slider.');
          return;
        }
        applyFadeLayout();
      }
      const activeIndex = carouselApi.selectedScrollSnap();
      slides.forEach((slide, index) => {
        Array.from(slide.classList).forEach((className) => {
          if (/^(upcoming|upcomming|passed)-\d+$/.test(className)) {
            slide.classList.remove(className);
          }
        });
        slide.classList.toggle('is-active', index === activeIndex);
        if (fadeMode) {
          slide.style.opacity = index === activeIndex ? '1' : '0';
          slide.style.zIndex = index === activeIndex ? '2' : '1';
          slide.style.pointerEvents = index === activeIndex ? 'auto' : 'none';
        }
        if (!slideClassesEnabled) return;
        slide.classList.toggle('is-passed', index < activeIndex);
        slide.classList.toggle('is-upcoming', index > activeIndex);
        slide.classList.toggle('is-prev', index === activeIndex - 1);
        slide.classList.toggle('is-next', index === activeIndex + 1);

        if (index > activeIndex) {
          const distance = index - activeIndex;
          slide.classList.add(`upcoming-${distance}`);
        } else if (index < activeIndex) {
          const distance = activeIndex - index;
          slide.classList.add(`passed-${distance}`);
        }
      });
      updateSlideButtons(activeIndex);
    }

    function updateSlideButtons(activeIndex) {
      if (!slideButtons.length) return;
      slideButtons.forEach((button, arrayIndex) => {
        // Use explicit index if available, otherwise use array index
        const buttonIndex = button.hasAttribute('data-slide-index')
          ? Number.parseInt(button.getAttribute('data-slide-index'), 10)
          : arrayIndex;
        const isActive = buttonIndex === activeIndex;
        button.classList.toggle('is-active', isActive);
        if (isActive) {
          button.setAttribute('aria-current', 'true');
        } else {
          button.removeAttribute('aria-current');
        }
      });
    }

    function updateButtonStates() {
      if (!carouselApi) return;
      const canPrev = carouselApi.canScrollPrev();
      const canNext = carouselApi.canScrollNext();
      const bothDisabled = !canPrev && !canNext;
      // #region agent log
      fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
        body: JSON.stringify({
          sessionId: 'bec643',
          runId: 'pre-fix',
          hypothesisId: 'H4',
          location: 'carousel.js:updateButtonStates',
          message: 'button state computed',
          data: {
            canPrev,
            canNext,
            bothDisabled,
            hasNavWrapper: Boolean(navButtonsWrapper),
            hasPrev: Boolean(prevBtn),
            hasNext: Boolean(nextBtn),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion
      const stateKey = JSON.stringify({
        canPrev,
        canNext,
        bothDisabled,
        hasNavWrapper: Boolean(navButtonsWrapper),
        hasPrev: Boolean(prevBtn),
        hasNext: Boolean(nextBtn),
      });

      if (stateKey === lastButtonStateKey) return;
      lastButtonStateKey = stateKey;

      // #region agent log
      fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
        body: JSON.stringify({
          sessionId: 'bec643',
          runId: 'post-fix',
          hypothesisId: 'H6',
          location: 'carousel.js:updateButtonStates:domWrite',
          message: 'button DOM update applied',
          data: { canPrev, canNext, bothDisabled },
          timestamp: Date.now(),
        }),
      }).catch(() => { });
      // #endregion
      if (navButtonsWrapper) {
        navButtonsWrapper.style.display = bothDisabled ? 'none' : '';
        navButtonsWrapper.setAttribute('aria-hidden', String(bothDisabled));
      }
      if (prevBtn) {
        prevBtn.style.pointerEvents = canPrev ? 'auto' : 'none';
        prevBtn.style.opacity = canPrev ? '1' : '0.5';
        prevBtn.style.display = bothDisabled ? 'none' : '';
        prevBtn.setAttribute('aria-disabled', String(!canPrev));
      }
      if (nextBtn) {
        nextBtn.style.pointerEvents = canNext ? 'auto' : 'none';
        nextBtn.style.opacity = canNext ? '1' : '0.5';
        nextBtn.style.display = bothDisabled ? 'none' : '';
        nextBtn.setAttribute('aria-disabled', String(!canNext));
      }
    }

    function updateCustomProgressBar() {
      if (!customProgressBar || !carouselApi) return;

      const totalSlides = carouselApi.scrollSnapList().length;
      const currentIndex = carouselApi.selectedScrollSnap();
      const progress = Math.max(0, Math.min(1, carouselApi.scrollProgress())) * 100;
      const progressFill = customProgressBar.querySelector('.carousel-progress-fill');

      if (progressFill) {
        progressFill.style.width = `${progress}%`;
        customProgressBar.setAttribute('data-progress', progress.toFixed(1));
        customProgressBar.setAttribute('data-current-slide', currentIndex + 1);
        customProgressBar.setAttribute('data-total-slides', totalSlides);
      }
    }

    try {
      carouselApi = window.EmblaCarousel(carouselViewport, carouselOptions);

      carouselViewport._carousel = carouselApi;
      slider._carouselInstance = carouselApi;

      scrollToIndex = (index, jump = false) => {
        if (!carouselApi) return;
        carouselApi.scrollTo(index, jump);
      };

      ensureDots();

      // Verify we have the correct number of buttons
      const slides = getSlides();
      if (slideButtons.length !== slides.length && slideButtons.length > 0) {
        logger.warn(
          `Carousel has ${slides.length} slides but ${slideButtons.length} slide buttons. Button indices may not match slide indices.`
        );
      }

      updateButtonStates();
      updateCustomProgressBar();
      updateActiveSlides();

      if (autoplayEnabled) {
        const startAutoplay = () => {
          if (autoplayTimer) return;
          autoplayTimer = window.setInterval(() => {
            if (!carouselApi) return;
            if (fadeMode) {
              const currentIndex = carouselApi.selectedScrollSnap();
              const totalSlides = carouselApi.scrollSnapList().length;
              const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
              scrollToIndex(nextIndex, true);
              return;
            }
            if (carouselApi.canScrollNext()) {
              carouselApi.scrollNext();
            } else {
              carouselApi.scrollTo(0);
            }
          }, autoplayDelay);
        };

        const stopAutoplay = () => {
          if (autoplayTimer) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
          }
        };

        restartAutoplay = () => {
          if (autoplayStopOnInteraction) return;
          stopAutoplay();
          startAutoplay();
        };

        startAutoplay();

        if (autoplayStopOnInteraction) {
          const stopHandler = () => stopAutoplay();
          slider.addEventListener('pointerdown', stopHandler);
          slider.addEventListener('keydown', stopHandler);
          cleanupTasks.push(() => {
            slider.removeEventListener('pointerdown', stopHandler);
            slider.removeEventListener('keydown', stopHandler);
          });
        }

        cleanupTasks.push(() => stopAutoplay());
      }

      const onSelect = () => {
        updateButtonStates();
        updateCustomProgressBar();
        updateActiveSlides();
      };
      const onScroll = () => {
        if (fadeMode) {
          applyFadeLayout();
        }
        updateCustomProgressBar();
      };
      const onReInit = () => {
        ensureDots();
        updateButtonStates();
        updateCustomProgressBar();
        updateActiveSlides();
      };

      carouselApi.on('select', onSelect);
      carouselApi.on('scroll', onScroll);
      carouselApi.on('reInit', onReInit);

      cleanupTasks.push(() => {
        carouselApi.off('select', onSelect);
        carouselApi.off('scroll', onScroll);
        carouselApi.off('reInit', onReInit);
      });

      const resizeHandler = () => {
        if (fadeMode) {
          applyFadeLayout();
        }
        updateCustomProgressBar();
      };
      window.addEventListener('resize', resizeHandler);
      cleanupTasks.push(() => window.removeEventListener('resize', resizeHandler));

      if (nextBtn) {
        const nextHandler = () => {
          if (fadeMode) {
            const currentIndex = carouselApi.selectedScrollSnap();
            const totalSlides = carouselApi.scrollSnapList().length;
            const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
            scrollToIndex(nextIndex, true);
            return;
          }
          carouselApi.scrollNext();
        };
        nextBtn.addEventListener('click', nextHandler);
        nextBtn.setAttribute('aria-label', 'Next slide');
        nextBtn.setAttribute('role', 'button');
        cleanupTasks.push(() => nextBtn.removeEventListener('click', nextHandler));
      }
      if (prevBtn) {
        const prevHandler = () => {
          if (fadeMode) {
            const currentIndex = carouselApi.selectedScrollSnap();
            const totalSlides = carouselApi.scrollSnapList().length;
            const prevIndex = currentIndex - 1 < 0 ? totalSlides - 1 : currentIndex - 1;
            scrollToIndex(prevIndex, true);
            return;
          }
          carouselApi.scrollPrev();
        };
        prevBtn.addEventListener('click', prevHandler);
        prevBtn.setAttribute('aria-label', 'Previous slide');
        prevBtn.setAttribute('role', 'button');
        cleanupTasks.push(() => prevBtn.removeEventListener('click', prevHandler));
      }
      if (slideButtons.length) {
        slideButtons.forEach((button, index) => {
          // Support explicit slide index via data-slide-index attribute
          const explicitIndex = button.hasAttribute('data-slide-index')
            ? Number.parseInt(button.getAttribute('data-slide-index'), 10)
            : index;

          // Clamp to valid slide range
          const targetIndex = Math.max(0, Math.min(explicitIndex, slides.length - 1));

          const clickHandler = () => {
            scrollToIndex(targetIndex, fadeMode);
            if (restartAutoplay) {
              restartAutoplay();
            }
          };
          button.addEventListener('click', clickHandler);
          button.setAttribute('type', 'button');
          button.setAttribute('role', 'button');
          if (!button.hasAttribute('aria-label')) {
            button.setAttribute('aria-label', `Go to slide ${targetIndex + 1}`);
          }
          cleanupTasks.push(() => button.removeEventListener('click', clickHandler));
        });
      }

      if (clickToCenter) {
        const slides = getSlides();
        slides.forEach((slide, index) => {
          const slideHandler = () => scrollToIndex(index, fadeMode);
          slide.addEventListener('click', slideHandler);
          cleanupTasks.push(() => slide.removeEventListener('click', slideHandler));
        });
      }

      if (!slider._keyboardSetup) {
        const keyboardHandler = (event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (fadeMode) {
              const currentIndex = carouselApi.selectedScrollSnap();
              const totalSlides = carouselApi.scrollSnapList().length;
              const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
              scrollToIndex(nextIndex, true);
            } else {
              carouselApi.scrollNext();
            }
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (fadeMode) {
              const currentIndex = carouselApi.selectedScrollSnap();
              const totalSlides = carouselApi.scrollSnapList().length;
              const prevIndex = currentIndex - 1 < 0 ? totalSlides - 1 : currentIndex - 1;
              scrollToIndex(prevIndex, true);
            } else {
              carouselApi.scrollPrev();
            }
          }
        };
        slider.addEventListener('keydown', keyboardHandler);
        slider.tabIndex = 0;
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Carousel');
        slider._keyboardSetup = true;
        cleanupTasks.push(() => slider.removeEventListener('keydown', keyboardHandler));
      }

      registerSyncedSlider(syncId, carouselApi);

      slider._carouselCleanup = cleanupTasks;
    } catch (error) {
      handleError(error, 'Carousel Initialization');
    }
  });

  logger.log(`✅ ${sliderList.length} carousel(s) initialized`);
}

/**
 * Get carousel instance from slider or viewport
 * @param {string|HTMLElement} selector
 * @returns {Object|null}
 */
export function getCarouselInstance(selector) {
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) return null;
  return (
    element._carouselInstance ||
    element._carousel ||
    element.querySelector?.(VIEWPORT_SELECTOR)?._carousel ||
    null
  );
}

/**
 * Destroy all carousel instances
 */
export function destroyCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((slider) => {
    // #region agent log
    fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
      body: JSON.stringify({
        sessionId: 'bec643',
        runId: 'pre-fix',
        hypothesisId: 'H2',
        location: 'carousel.js:destroyCarousels:entry',
        message: 'destroy slider entry',
        data: {
          initialized: Boolean(slider._carouselInitialized),
          keyboardSetup: Boolean(slider._keyboardSetup),
          hasCleanup: Array.isArray(slider._carouselCleanup),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => { });
    // #endregion
    if (Array.isArray(slider._carouselCleanup)) {
      slider._carouselCleanup.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          handleError(error, 'Carousel Cleanup');
        }
      });
      slider._carouselCleanup = null;
    }

    const carouselApi =
      slider._carouselInstance || slider.querySelector?.(VIEWPORT_SELECTOR)?._carousel || null;

    if (carouselApi) {
      carouselApi.destroy();
    }
  });

  syncedSliderGroups.clear();
  // #region agent log
  fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
    body: JSON.stringify({
      sessionId: 'bec643',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'carousel.js:destroyCarousels:exit',
      message: 'destroy complete and sync groups cleared',
      data: { groupCount: syncedSliderGroups.size },
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion
}

/**
 * Register a carousel instance inside a sync group
 * @param {string|null} syncId
 * @param {Object} carouselApi
 */
function registerSyncedSlider(syncId, carouselApi) {
  if (!syncId || !carouselApi) return;

  if (!syncedSliderGroups.has(syncId)) {
    syncedSliderGroups.set(syncId, new Set());
  }

  const group = syncedSliderGroups.get(syncId);
  group.add(carouselApi);
  // #region agent log
  fetch('http://127.0.0.1:7904/ingest/28d5dfef-4134-4721-9a33-0b2780d3a11f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec643' },
    body: JSON.stringify({
      sessionId: 'bec643',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'carousel.js:registerSyncedSlider',
      message: 'synced slider registered',
      data: { syncId, groupSize: group.size },
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion

  const syncHandler = () => {
    const targetIndex = carouselApi.selectedScrollSnap();
    group.forEach((otherCarousel) => {
      if (otherCarousel === carouselApi) return;
      otherCarousel.scrollTo(targetIndex);
    });
  };

  carouselApi.on('select', syncHandler);
  carouselApi.on('reInit', syncHandler);

  carouselApi.on('destroy', () => {
    carouselApi.off('select', syncHandler);
    carouselApi.off('reInit', syncHandler);
    group.delete(carouselApi);
    if (group.size === 0) {
      syncedSliderGroups.delete(syncId);
    }
  });
}
