/**
 * Tabs Component (Shared Utility)
 * Autoplay-ready tabs with a11y, progress bars, and mobile scroll assist.
 * Use on any page that renders tabs.
 *
 * Quick start:
 * 1) Import: import { initTabs, cleanupTabs } from '../components/tabs';
 * 2) Markup:
 *    <div tabs-comp>
 *      <div tabs-list>
 *        <button tabs-btn>Tab 1<div class="tab-btn-progress"></div></button>
 *      </div>
 *      <div tabs-content>...</div>
 *    </div>
 * 3) Call initTabs() once after DOM ready; call cleanupTabs() on teardown.
 *
 * Data attributes (on [tabs-comp]):
 * - data-tabs-autoplay="true"             Enable autoplay (default false)
 * - data-tabs-autoplay-delay="5000"    Autoplay interval in ms
 * - data-tabs-autoplay-pause-on-hover  Pause autoplay on hover (default false)
 * - data-tabs-autoplay-pause-on-focus  Pause autoplay on focus (default false)
 * - data-tabs-autoplay-pause-on-hidden Pause autoplay when tab hidden (default true)
 * - data-tabs-scroll-active="false"    Disable mobile auto-scroll to active tab
 * - data-tabs-animate="false"          Disable content element animations
 * - data-tabs-loop="false"             Disable looping navigation/autoplay
 * - data-tabs-active-class="is-active" Active class name (default "active")
 * - data-tabs-activate-on="hover"      Use hover instead of click
 * - data-tabs-advance-on-video-end    When set, advance to next tab when the active panel's video ends; play/pause videos on tab change (use with data-tabs-autoplay="true")
 * - data-stop-autoplay-on-first-interaction Stop autoplay on first click/keyboard
 */

import { handleError } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const DEFAULT_AUTOPLAY_MS = 5000;
const instances = new Map();
let instanceCounter = 0;

const SELECTORS = {
  root: '[tabs-comp]',
  list: '[tabs-list]',
  button: '[tabs-btn]',
  panel: '[tabs-content]',
  panelElement: '[tabs-content-element]',
  scrollWrap: '[tabs-scroll-wrap]',
  progress: '.tab-btn-progress, [tab-btn-progress]',
  video: 'video',
};

export function initTabs(options = {}) {
  if (typeof document === 'undefined') {
    logger.warn('[Tabs] document is undefined (SSR) - skipping init.');
    return () => { };
  }

  const roots =
    options.rootElements ||
    Array.from(document.querySelectorAll(options.rootSelector || SELECTORS.root));

  if (!roots.length) {
    logger.info('[Tabs] No tabs found on the page - nothing to initialize.');
    return () => { };
  }

  let initializedCount = 0;

  roots.forEach((root) => {
    if (instances.has(root)) return;
    const cleanup = createTabsInstance(root);
    if (cleanup) {
      instances.set(root, cleanup);
      initializedCount += 1;
    }
  });

  if (initializedCount > 0) {
    logger.log(`🧭 Tabs ready (${initializedCount} instance${initializedCount > 1 ? 's' : ''})`);
    console.log('[tabsComp1] Tabs loaded', initializedCount, 'instance(s)');
  }

  return () => cleanupTabs();
}

export function cleanupTabs() {
  instances.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Tabs Cleanup');
    }
  });
  instances.clear();
}

function createTabsInstance(root) {
  const buttons = Array.from(root.querySelectorAll(SELECTORS.button));
  const panels = Array.from(root.querySelectorAll(SELECTORS.panel));
  if (!buttons.length || buttons.length !== panels.length) return null;

  instanceCounter += 1;
  const instanceId = instanceCounter;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const autoplayEnabled = getBooleanAttr(root, 'data-tabs-autoplay', false);
  const autoplayMs = getNumberAttr(root, 'data-tabs-autoplay-delay', DEFAULT_AUTOPLAY_MS);
  const pauseOnHover = getBooleanAttr(root, 'data-tabs-autoplay-pause-on-hover', false);
  const pauseOnFocus = getBooleanAttr(root, 'data-tabs-autoplay-pause-on-focus', false);
  const pauseOnHidden = getBooleanAttr(root, 'data-tabs-autoplay-pause-on-hidden', true);
  const scrollActive = getBooleanAttr(root, 'data-tabs-scroll-active', true);
  const animateContent = getBooleanAttr(root, 'data-tabs-animate', true);
  const loopTabs = getBooleanAttr(root, 'data-tabs-loop', true);
  const activateOn = root.getAttribute('data-tabs-activate-on') || 'click';
  const activeClass = root.getAttribute('data-tabs-active-class') || 'active';
  const stopAutoplayOnFirstInteraction = getBooleanAttr(
    root,
    'data-stop-autoplay-on-first-interaction',
    false
  );
  const advanceOnVideoEnd = root.hasAttribute('data-tabs-advance-on-video-end');

  const presetIndex = findPresetIndex(buttons, activeClass);
  let activeIndex = presetIndex > -1 ? presetIndex : 0;
  let hasInitialized = false;

  const observerSupported = typeof IntersectionObserver !== 'undefined';
  let isInView = false;
  let isPaused = false;
  let isAutoplayStopped = false;
  let hasUserInteracted = false;

  let timerId = null;
  let remainingMs = autoplayMs;
  let cycleStartTs = 0;

  let videoEndedCleanup = null;
  let setActiveTransitionId = 0;

  const cleanupHandlers = [];

  const now = () => (window.performance ? performance.now() : Date.now());

  const setPanelVisibility = (panel, isVisible) => {
    if (!panel) return;
    panel.hidden = !isVisible;
    panel.style.display = isVisible ? '' : 'none';
  };

  const getVideosInPanel = (panel) => {
    if (!panel) return [];
    if (panel.tagName && panel.tagName.toLowerCase() === 'video') return [panel];
    return Array.from(panel.querySelectorAll(SELECTORS.video));
  };

  const pausePanelVideos = (panel) => {
    getVideosInPanel(panel).forEach((v) => {
      try {
        v.pause();
      } catch (e) {
        // ignore
      }
    });
  };

  const playPanelVideos = (panel) => {
    const videos = getVideosInPanel(panel);
    const first = videos[0];
    if (!first) return;
    first.muted = true;
    const playPromise = first.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => { });
    }
  };

  const setupVideoAdvance = (panel, currentIdx) => {
    if (videoEndedCleanup) {
      videoEndedCleanup();
      videoEndedCleanup = null;
    }
    const videos = getVideosInPanel(panel);
    const firstVideo = videos[0];
    if (!firstVideo || !advanceOnVideoEnd) return;

    const onEnded = () => {
      const nextIdx = getNextIndex(currentIdx, buttons.length, loopTabs);
      if (nextIdx !== currentIdx) {
        setActive(nextIdx, false);
      }
    };
    firstVideo.addEventListener('ended', onEnded);
    videoEndedCleanup = () => {
      firstVideo.removeEventListener('ended', onEnded);
      videoEndedCleanup = null;
    };
    firstVideo.muted = true;
    const playPromise = firstVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => { });
    }
  };

  // Initial state
  panels.forEach((panel, idx) => {
    setPanelVisibility(panel, false);
    panel.classList.remove(activeClass);
    if (animateContent) {
      const items = panel.querySelectorAll(SELECTORS.panelElement);
      items.forEach((el) => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    }
    if (idx === activeIndex) {
      setPanelVisibility(panel, true);
      panel.classList.add(activeClass);
    }
  });

  // Progress helpers
  const getProgressEl = (idx) => buttons[idx]?.querySelector(SELECTORS.progress) || null;

  const setProgressInstant = (idx, percent) => {
    const progress = getProgressEl(idx);
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    void progress.offsetWidth;
  };

  const animateProgressToEnd = (idx, ms) => {
    const progress = getProgressEl(idx);
    if (!progress) return;
    progress.style.transition = 'none';
    void progress.offsetWidth;
    progress.style.transition = `width ${ms}ms linear`;
    progress.style.width = '100%';
  };

  const getTabsScroller = () => {
    const explicit = root.querySelector(SELECTORS.scrollWrap);
    if (explicit) return explicit;

    const btn0 = buttons[0];
    if (!btn0) return null;

    let el = btn0.parentElement;
    while (el && el !== root) {
      const cs = window.getComputedStyle(el);
      const ox = cs.overflowX;
      const canScroll = (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 2;
      if (canScroll) return el;
      el = el.parentElement;
    }
    return null;
  };

  const scrollActiveTabIntoView = (idx) => {
    if (!scrollActive) return;
    const scroller = getTabsScroller();
    const btn = buttons[idx];
    if (!scroller || !btn) return;

    const behavior = prefersReducedMotion ? 'auto' : 'smooth';
    const scrollerRect = scroller.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const btnCenter = btnRect.left - scrollerRect.left + btnRect.width / 2;
    const desiredLeft = btnCenter - scroller.clientWidth / 2;

    const nextScrollLeft = Math.max(
      0,
      Math.min(scroller.scrollWidth - scroller.clientWidth, scroller.scrollLeft + desiredLeft)
    );

    scroller.scrollTo({ left: nextScrollLeft, behavior });
  };

  const pauseAutoplayAndProgress = () => {
    if (!autoplayEnabled) return;
    if (advanceOnVideoEnd && videoEndedCleanup) {
      videoEndedCleanup();
      videoEndedCleanup = null;
    }
    if (isAutoplayStopped) {
      setProgressInstant(activeIndex, 100);
      return;
    }
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (cycleStartTs) {
      const elapsed = now() - cycleStartTs;
      remainingMs = Math.max(0, remainingMs - elapsed);
    }
    cycleStartTs = 0;

    const percent = 100 * (1 - remainingMs / autoplayMs);
    setProgressInstant(activeIndex, percent);
  };

  const startAutoplayAndProgress = () => {
    if (!autoplayEnabled || !isInView || isPaused || isAutoplayStopped) return;

    if (advanceOnVideoEnd) {
      const nextPanel = panels[activeIndex];
      setupVideoAdvance(nextPanel, activeIndex);
      return;
    }

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (remainingMs <= 0) {
      remainingMs = autoplayMs;
      setActive(getNextIndex(activeIndex, buttons.length, loopTabs), false);
      return;
    }

    const percent = 100 * (1 - remainingMs / autoplayMs);
    setProgressInstant(activeIndex, percent);
    animateProgressToEnd(activeIndex, remainingMs);

    cycleStartTs = now();
    timerId = window.setTimeout(() => {
      remainingMs = autoplayMs;
      setActive(getNextIndex(activeIndex, buttons.length, loopTabs), false);
    }, remainingMs);
  };

  const resetCycle = () => {
    remainingMs = autoplayMs;
    cycleStartTs = 0;
  };

  // Content animations (GSAP only)
  const animateInContentElements = (panel) => {
    if (!panel || !animateContent) return;
    const items = Array.from(panel.querySelectorAll(SELECTORS.panelElement));
    if (!items.length) return;

    const gsap = typeof window !== 'undefined' && window.gsap;
    if (!gsap) return;

    const duration = prefersReducedMotion ? 0.25 : 0.5;
    const stagger = prefersReducedMotion ? 0.02 : 0.05;
    const fromY = prefersReducedMotion ? 0 : 20;
    const fromBlur = prefersReducedMotion ? 0 : 8;
    const fromScale = prefersReducedMotion ? 1 : 0.98;

    gsap
      .timeline()
      .set(items, {
        opacity: 0,
        y: fromY,
        pointerEvents: 'auto',
        filter: `blur(${fromBlur}px)`,
        scale: fromScale,
      })
      .to(items, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration,
        stagger,
        ease: 'power2.out',
      });
  };

  const animateOutContentElements = (panel) =>
    new Promise((resolve) => {
      if (!panel || !animateContent) return resolve();
      const items = Array.from(panel.querySelectorAll(SELECTORS.panelElement));
      if (!items.length) return resolve();

      const gsap = typeof window !== 'undefined' && window.gsap;
      if (!gsap) return resolve();

      const duration = prefersReducedMotion ? 0.2 : 0.3;
      const stagger = prefersReducedMotion ? 0.02 : 0.04;
      const toY = prefersReducedMotion ? 0 : -10;
      const toBlur = prefersReducedMotion ? 0 : 6;
      const toScale = prefersReducedMotion ? 1 : 0.98;

      gsap.killTweensOf(items);
      gsap.to(items, {
        opacity: 0,
        y: toY,
        filter: `blur(${toBlur}px)`,
        scale: toScale,
        duration,
        stagger,
        ease: 'power2.in',
        onComplete: () => {
          items.forEach((el) => (el.style.pointerEvents = 'none'));
          resolve();
        },
      });
    });

  const setActive = (index, userTriggered) => {
    if (index < 0 || index >= buttons.length) return Promise.resolve();
    if (index === activeIndex && hasInitialized) return Promise.resolve();

    const thisTransitionId = ++setActiveTransitionId;

    if (userTriggered && stopAutoplayOnFirstInteraction && !hasUserInteracted) {
      hasUserInteracted = true;
      isAutoplayStopped = true;
      isPaused = true;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      remainingMs = autoplayMs;
      cycleStartTs = 0;
    }

    pauseAutoplayAndProgress();
    resetCycle();

    const prevIndex = activeIndex;
    const prevPanel = hasInitialized ? panels[prevIndex] : null;
    const nextPanel = panels[index];
    if (!nextPanel) return Promise.resolve();

    activeIndex = index;

    buttons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle(activeClass, isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');

      const progress = btn.querySelector(SELECTORS.progress);
      if (progress) {
        progress.style.transition = 'none';
        progress.style.width = '0%';
        void progress.offsetWidth;
      }
    });

    scrollActiveTabIntoView(index);

    setPanelVisibility(nextPanel, true);
    nextPanel.classList.add(activeClass);
    nextPanel.setAttribute('aria-hidden', 'false');

    panels.forEach((panel) => {
      if (panel !== nextPanel && panel !== prevPanel) {
        panel.classList.remove(activeClass);
        setPanelVisibility(panel, false);
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    const outPromise =
      prevPanel && prevPanel !== nextPanel
        ? animateOutContentElements(prevPanel)
        : Promise.resolve();

    return outPromise.then(() => {
      if (thisTransitionId !== setActiveTransitionId) return;

      panels.forEach((panel) => {
        if (panel !== nextPanel) {
          panel.classList.remove(activeClass);
          setPanelVisibility(panel, false);
          panel.setAttribute('aria-hidden', 'true');
        }
      });

      animateInContentElements(nextPanel);
      hasInitialized = true;

      pausePanelVideos(prevPanel);
      playPanelVideos(nextPanel);

      if (autoplayEnabled && isInView && !isPaused && !isAutoplayStopped) {
        startAutoplayAndProgress();
      } else if (isAutoplayStopped) {
        setProgressInstant(activeIndex, 100);
      }

      root.dispatchEvent(
        new CustomEvent('tabs:change', {
          detail: {
            index,
            button: buttons[index],
            panel: nextPanel,
            reason: userTriggered ? 'user' : 'auto',
          },
          bubbles: true,
        })
      );
    });
  };

  const focusButton = (idx) => {
    const btn = buttons[idx];
    if (!btn) return;
    try {
      btn.focus({ preventScroll: true });
    } catch (error) {
      btn.focus();
    }
  };

  const onButtonKeydown = (event, idx) => {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      setActive(idx, true);
      return;
    }

    if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Home' || key === 'End') {
      event.preventDefault();
      let nextIndex = idx;
      if (key === 'ArrowRight') nextIndex = getNextIndex(idx, buttons.length, loopTabs);
      if (key === 'ArrowLeft') nextIndex = getPrevIndex(idx, buttons.length, loopTabs);
      if (key === 'Home') nextIndex = 0;
      if (key === 'End') nextIndex = buttons.length - 1;
      setActive(nextIndex, true).then(() => focusButton(nextIndex));
    }
  };

  const listElement = root.querySelector(SELECTORS.list) || buttons[0].parentElement;
  if (listElement && !listElement.hasAttribute('role')) {
    listElement.setAttribute('role', 'tablist');
  }

  buttons.forEach((btn, i) => {
    const btnId = `tabs-btn-${instanceId}-${i}`;
    const panelId = `tabs-panel-${instanceId}-${i}`;
    const isActive = i === activeIndex;
    btn.id = btn.id || btnId;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    btn.classList.toggle(activeClass, isActive);

    panels[i].id = panels[i].id || panelId;
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', btn.id);
    panels[i].setAttribute('aria-hidden', isActive ? 'false' : 'true');

    const onClick = (evt) => {
      evt.preventDefault();
      setActive(i, true);
    };

    const onHover = () => {
      if (activateOn === 'hover') setActive(i, true);
    };

    const onKeydown = (evt) => onButtonKeydown(evt, i);

    btn.addEventListener('click', onClick);
    btn.addEventListener('keydown', onKeydown);
    cleanupHandlers.push(() => btn.removeEventListener('click', onClick));
    cleanupHandlers.push(() => btn.removeEventListener('keydown', onKeydown));

    if (activateOn === 'hover') {
      btn.addEventListener('mouseenter', onHover);
      cleanupHandlers.push(() => btn.removeEventListener('mouseenter', onHover));
    }
  });

  if (pauseOnHover) {
    const onEnter = () => {
      isPaused = true;
      pauseAutoplayAndProgress();
    };
    const onLeave = () => {
      isPaused = false;
      startAutoplayAndProgress();
    };
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);
    cleanupHandlers.push(() => root.removeEventListener('mouseenter', onEnter));
    cleanupHandlers.push(() => root.removeEventListener('mouseleave', onLeave));
  }

  if (pauseOnFocus) {
    const onFocusIn = () => {
      isPaused = true;
      pauseAutoplayAndProgress();
    };
    const onFocusOut = () => {
      isPaused = false;
      startAutoplayAndProgress();
    };
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    cleanupHandlers.push(() => root.removeEventListener('focusin', onFocusIn));
    cleanupHandlers.push(() => root.removeEventListener('focusout', onFocusOut));
  }

  if (pauseOnHidden) {
    const onVisibility = () => {
      if (document.hidden) {
        pauseAutoplayAndProgress();
      } else {
        startAutoplayAndProgress();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    cleanupHandlers.push(() => document.removeEventListener('visibilitychange', onVisibility));
  }

  const observer = observerSupported
    ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== root) return;

          if (entry.isIntersecting) {
            isInView = true;
            if (hasInitialized) {
              scrollActiveTabIntoView(activeIndex);
              startAutoplayAndProgress();
            } else {
              setActive(activeIndex, false).then(() => {
                startAutoplayAndProgress();
              });
            }
          } else {
            isInView = false;
            pauseAutoplayAndProgress();
          }
        });
      },
      { threshold: 0.2 }
    )
    : null;

  if (observer) {
    observer.observe(root);
  } else {
    isInView = true;
    setActive(activeIndex, false).then(() => {
      startAutoplayAndProgress();
    });
  }

  return () => {
    if (videoEndedCleanup) {
      videoEndedCleanup();
      videoEndedCleanup = null;
    }
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (observer) observer.disconnect();
    cleanupHandlers.forEach((cleanup) => cleanup());
    cleanupHandlers.length = 0;
  };
}

function getBooleanAttr(element, attr, fallback) {
  if (!element || !element.hasAttribute(attr)) return fallback;
  const value = element.getAttribute(attr);
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
}

function getNumberAttr(element, attr, fallback) {
  if (!element || !element.hasAttribute(attr)) return fallback;
  const value = Number(element.getAttribute(attr));
  return Number.isFinite(value) ? value : fallback;
}

function findPresetIndex(buttons, activeClass) {
  const byActive = buttons.findIndex((btn) => btn.classList.contains(activeClass));
  if (byActive > -1) return byActive;
  const byIsActive = buttons.findIndex((btn) => btn.classList.contains('is-active'));
  if (byIsActive > -1) return byIsActive;
  return -1;
}

function getNextIndex(current, total, loop) {
  if (current + 1 < total) return current + 1;
  return loop ? 0 : total - 1;
}

function getPrevIndex(current, total, loop) {
  if (current - 1 >= 0) return current - 1;
  return loop ? total - 1 : 0;
}

