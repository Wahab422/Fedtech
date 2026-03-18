/**
 * Tab Component (GSAP-animated, multi-pane)
 * Uses [tab], [tab-btn], [tab-pane], [tab-content], [tab-content-elements].
 * Optional auto-advance and menu scroll-into-view.
 *
 * Quick start:
 * 1) Import: import { initTab, cleanupTab } from '../components/tab';
 * 2) Ensure GSAP is loaded (e.g. initGSAP() or ensureGSAPLoaded()).
 * 3) Markup:
 *    <div tab tab-active="1" data-autoplay-interval="5000">
 *      <div tab-menu>
 *        <button tab-btn>Tab 1</button>
 *        <button tab-btn>Tab 2</button>
 *      </div>
 *      <div tab-pane>
 *        <div tab-content>...</div>
 *        <div tab-content>
 *          <div tab-content-elements>...</div>
 *        </div>
 *      </div>
 *    </div>
 * 4) Call initTab() after DOM ready; call cleanupTab() on teardown.
 *
 * Attributes (on [tab]):
 * - tab-active="1"     Initial active tab (1-based). Default 1.
 * - auto-change="5"   Auto-advance interval in seconds. Omit to disable.
 *
 * Autoplay (like accordion, in-view only):
 * - data-autoplay-interval="5000" on [tab] or [tab-btn] - Autoplay interval in ms (clamped 1000–60000).
 * - data-tab-interval-duration="3000" on [tab-btn] - Per-tab display duration in ms (overrides default).
 */

import { handleError } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const instances = new Map();

const SELECTORS = {
  root: '[tab]',
  btn: '[tab-btn]',
  pane: '[tab-pane]',
  content: '[tab-content]',
  contentElements: '[tab-content-elements]',
  menu: '[tab-menu]',
};

export function initTab(options = {}) {
  if (typeof document === 'undefined') {
    logger.warn('[Tab] document is undefined (SSR) - skipping init.');
    return () => {};
  }

  const roots = Array.from(document.querySelectorAll(options.rootSelector || SELECTORS.root));

  if (!roots.length) {
    return () => {};
  }

  let count = 0;
  roots.forEach((root) => {
    if (instances.has(root)) return;
    const cleanup = createTabInstance(root);
    if (cleanup) {
      instances.set(root, cleanup);
      count += 1;
    }
  });

  if (count > 0) {
    logger.log(`📑 Tab ready (${count} instance${count > 1 ? 's' : ''})`);
  }

  return () => cleanupTab();
}

export function cleanupTab() {
  instances.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Tab Cleanup');
    }
  });
  instances.clear();
}

function createTabInstance(tab) {
  const buttons = tab.querySelectorAll(SELECTORS.btn);
  const panes = tab.querySelectorAll(SELECTORS.pane);
  if (!buttons.length || !panes.length) return null;

  const firstPaneContents = panes[0].querySelectorAll(SELECTORS.content);
  let activeIndex = parseInt(tab.getAttribute('tab-active'), 10) - 1 || 0;
  activeIndex = Math.max(0, Math.min(activeIndex, firstPaneContents.length - 1));

  let autoTimer = null;
  let isAnimating = false;
  let masterTL = null;
  let autoplayObserver = null;

  // Autoplay: data-autoplay-interval (ms) on [tab] or [tab-btn], or auto-change (sec), or any data-tab-interval-duration
  const parseAutoplayInterval = () => {
    const raw =
      tab.getAttribute('data-autoplay-interval') ??
      buttons[0]?.getAttribute('data-autoplay-interval') ??
      '';
    if (raw != null && raw !== '') {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n > 0) {
        return Math.min(60000, Math.max(1000, n));
      }
    }
    const autoChangeAttr = tab.getAttribute('auto-change');
    if (autoChangeAttr) {
      const sec = parseFloat(autoChangeAttr) * 1000;
      return Number.isFinite(sec) && sec > 0 ? sec : null;
    }
    // If any tab-btn has data-tab-interval-duration, enable autoplay with 5000ms default
    const hasPerTabDuration = Array.from(buttons).some((btn) => {
      const v = btn?.getAttribute('data-tab-interval-duration');
      return v != null && v !== '' && Number.isFinite(parseInt(v, 10));
    });
    return hasPerTabDuration ? 5000 : null;
  };
  const autoDelay = parseAutoplayInterval();

  const getDurationMs = (index) => {
    const btn = buttons[index];
    if (!btn) return autoDelay;
    const raw = btn?.getAttribute('data-tab-interval-duration');
    if (raw == null || raw === '') return autoDelay;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? Math.min(60000, Math.max(1000, n)) : autoDelay;
  };

  const OVERLAP_TIME = 0.3;

  const gsap = typeof window !== 'undefined' ? window.gsap : null;
  if (!gsap) {
    logger.warn('[Tab] GSAP not found - tab will work without animations.');
  }

  const cleanupHandlers = [];

  /* ----------------------------------
     AUTO CHANGE (accordion-style: in-view only, per-tab duration)
  ---------------------------------- */
  const isTabInView = () => {
    const rect = tab.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right > 0
    );
  };

  const stopAutoChange = () => {
    if (autoTimer != null) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  };

  const advanceToNext = () => {
    if (!autoDelay) return;
    let next = activeIndex + 1;
    if (next >= firstPaneContents.length) next = 0;
    activateTab(next, true);
    const duration = getDurationMs(next);
    autoTimer = setTimeout(advanceToNext, duration);
  };

  const resetAutoChange = () => {
    if (!autoDelay) return;
    if (!isTabInView()) return;
    stopAutoChange();
    startAutoChange();
  };

  const startAutoChange = () => {
    if (!autoDelay) return;
    if (!isTabInView()) return;
    if (autoTimer != null) return;
    const duration = getDurationMs(activeIndex);
    autoTimer = setTimeout(advanceToNext, duration);
  };

  /* ----------------------------------
     CHILD ANIMATION
  ---------------------------------- */
  const animateChildren = (parent, tl, direction = 'in') => {
    const groups = parent.querySelectorAll(`:scope > ${SELECTORS.contentElements}`);
    if (!groups.length) return;

    groups.forEach((group) => {
      const children = group.children;
      if (!children.length) return;

      if (gsap) {
        tl.fromTo(
          children,
          {
            opacity: direction === 'in' ? 0 : 1,
            y: direction === 'in' ? 20 : 0,
          },
          {
            opacity: direction === 'in' ? 1 : 0,
            y: direction === 'in' ? 0 : -20,
            stagger: direction === 'in' ? 0.1 : { each: 0.1, from: 'end' },
            duration: 0.5,
            ease: 'power2.inOut',
          },
          '-=0.4'
        );
      }

      animateChildren(group, tl, direction);
    });
  };

  /* ----------------------------------
     ACTIVATE TAB (SAFE)
  ---------------------------------- */
  const activateTab = (newIndex, fromAuto = false) => {
    if (newIndex === activeIndex || isAnimating) return;

    isAnimating = true;

    if (masterTL) {
      masterTL.kill();
      masterTL = null;
    }

    const onComplete = () => {
      isAnimating = false;
      activeIndex = newIndex;
      if (!fromAuto) resetAutoChange();
    };

    if (gsap) {
      masterTL = gsap.timeline({ onComplete });
    } else {
      onComplete();
    }

    const oldContents = [];
    const newContents = [];

    panes.forEach((pane) => {
      const contents = pane.querySelectorAll(SELECTORS.content);
      if (contents[activeIndex]) oldContents.push(contents[activeIndex]);
      if (contents[newIndex]) newContents.push(contents[newIndex]);
    });

    if (gsap && masterTL) {
      // ---- OUT ----
      oldContents.forEach((oldContent) => {
        masterTL.to(oldContent, {
          opacity: 0,
          y: -20,
          duration: 0.35,
          ease: 'power2.inOut',
        });
        animateChildren(oldContent, masterTL, 'out');
      });
    }

    // ---- SWITCH ACTIVE (EARLY, only once) ----
    const switchActive = () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      buttons[newIndex].classList.add('active');

      panes.forEach((pane) => {
        const contents = pane.querySelectorAll(SELECTORS.content);
        contents.forEach((c) => c.classList.remove('active'));
        if (contents[newIndex]) contents[newIndex].classList.add('active');
      });

      const menu = buttons[newIndex].closest(SELECTORS.menu);
      if (menu) {
        const btnLeft = buttons[newIndex].offsetLeft;
        const btnWidth = buttons[newIndex].offsetWidth;
        const menuWidth = menu.offsetWidth;
        menu.scrollTo({
          left: btnLeft - menuWidth / 2 + btnWidth / 2,
          behavior: 'smooth',
        });
      }
    };

    if (gsap && masterTL) {
      masterTL.add(switchActive, '-=0.15');

      // ---- IN (OVERLAPPED) ----
      newContents.forEach((newContent) => {
        masterTL.fromTo(
          newContent,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.inOut' },
          `-=${OVERLAP_TIME}`
        );
        animateChildren(newContent, masterTL, 'in');
      });
    } else {
      switchActive();
      onComplete();
    }
  };

  /* ----------------------------------
     INIT
  ---------------------------------- */
  panes.forEach((pane) => {
    const contents = pane.querySelectorAll(SELECTORS.content);
    contents.forEach((content, i) => {
      content.classList.toggle('active', i === activeIndex);
    });
  });
  buttons.forEach((btn, i) => btn.classList.toggle('active', i === activeIndex));

  // Start autoplay (only when in view, via IntersectionObserver)
  if (autoDelay) {
    autoplayObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          startAutoChange();
        } else {
          stopAutoChange();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    );
    autoplayObserver.observe(tab);
  }

  /* ----------------------------------
     EVENTS
  ---------------------------------- */
  buttons.forEach((btn, index) => {
    const handler = () => activateTab(index);
    btn.addEventListener('click', handler);
    cleanupHandlers.push(() => btn.removeEventListener('click', handler));
  });

  return () => {
    stopAutoChange();
    if (autoplayObserver) {
      autoplayObserver.disconnect();
      autoplayObserver = null;
    }
    if (masterTL) masterTL.kill();
    cleanupHandlers.forEach((fn) => fn());
  };
}
