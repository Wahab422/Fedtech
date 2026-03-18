/**
 * Rive Animation Component (Shared Utility)
 * Bootstraps on first user interaction (scroll, mousemove, touchstart, pointerdown)
 * then initializes [data-rive-src] hosts. Uses loadScript for consistent script loading.
 *
 * Usage:
 * - initRive() is called from global init; no per-page setup needed.
 * - Rive initializes on first user interaction for better compatibility.
 *
 * Webflow Setup:
 * - Add data-rive-src="https://cdn.example.com/your-animation.riv" to the host element
 * - Optional: data-load="eager" — load Rive on page load (no wait for first user interaction)
 * - Optional: data-delay="0.5" (seconds) to delay play after entering viewport
 * - Optional: data-accordion-img — when present, animation only plays when data-accordion-img="active"
 *   (e.g. accordion open). Attribute is observed; animation always plays from the start.
 */

import { loadScript, handleError } from '../utils/helpers';
import { logger } from '../utils/logger';

const PLAY_THRESHOLD = 0.6;
const RIVE_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.35.0/rive.js';

let io = null;
let ro = null;
let tabObservers = [];
let accordionObservers = [];
let riveScriptPromise = null;
const activeHosts = new Set();

function isAccordionActive(el) {
  return (
    el.hasAttribute('data-accordion-img') && el.getAttribute('data-accordion-img') === 'active'
  );
}

function loadRiveScriptOnce() {
  if (riveScriptPromise) return riveScriptPromise;
  riveScriptPromise = loadScript(RIVE_SCRIPT_URL)
    .then(() => {
      if (typeof window.rive === 'undefined') {
        throw new Error('Rive runtime not found on window');
      }
      logger.log('✅ Rive runtime loaded');
      return window.rive;
    })
    .catch((err) => {
      riveScriptPromise = null;
      handleError(err, 'Rive Load');
      throw err;
    });
  return riveScriptPromise;
}

function cleanupRiveListeners() {
  const events = ['scroll', 'mousemove', 'touchstart', 'pointerdown'];
  events.forEach((event) => {
    window.removeEventListener(event, initRiveScript, { passive: true });
    document.removeEventListener(event, initRiveScript, { passive: true });
  });
}

function initRiveScript() {
  if (window.riveScriptInitialized) {
    cleanupRiveListeners();
    return;
  }
  window.riveScriptInitialized = true;
  cleanupRiveListeners();

  // --- Core Rive Logic ---
  const getPixelRatio = (w, h) => {
    const largest = Math.max(w, h);
    if (largest >= 512) return 2;
    if (largest >= 256) return 1.75;
    if (largest >= 128) return 1.5;
    return 1.25;
  };

  const ensureCanvas = (el) => {
    let canvas = el.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'rive-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText =
        'display:block;width:100%;height:100%;opacity:0;transition:opacity .35s ease;will-change:opacity';
      el.appendChild(canvas);
    }
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || 1));
    const h = Math.max(1, Math.round(rect.height || 1));
    const dpr = getPixelRatio(w, h);
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    return canvas;
  };

  const resizeHost = (el) => {
    try {
      ensureCanvas(el);
      el.__rive?.r?.resizeDrawingSurfaceToCanvas?.();
    } catch (_) {}
  };

  const getDelayMs = (el) => {
    const raw = el.getAttribute('data-delay');
    const s = raw == null || raw === '' ? 0 : parseFloat(raw);
    return Number.isFinite(s) && s > 0 ? Math.round(s * 1000) : 0;
  };

  const clearDelayTimer = (el) => {
    const t = el?.__rive?.delayTimeout;
    if (t) {
      clearTimeout(t);
      el.__rive.delayTimeout = null;
    }
  };

  const destroyHost = (el) => {
    try {
      el.__rive?.r?.cleanup?.();
    } catch (_) {}
    clearDelayTimer(el);
    el.__rive = null;
    el.querySelector('canvas')?.remove();
    activeHosts.delete(el);
  };

  const getAnimationNames = (r) => {
    try {
      if (Array.isArray(r.animationNames)) return r.animationNames;
      if (r.animations?.keys) return Array.from(r.animations.keys());
      if (r.animations && typeof r.animations === 'object') return Object.keys(r.animations);
    } catch (_) {}
    return [];
  };

  const getStateMachines = (r) => {
    try {
      if (Array.isArray(r.stateMachineNames)) return r.stateMachineNames;
      return r.stateMachines || [];
    } catch (_) {
      return [];
    }
  };

  // One Rive build at a time to avoid main-thread stalls when multiple load
  const buildQueue = [];
  let building = false;

  const doBuild = (el) =>
    new Promise((resolve) => {
      if (el.__rive?.r) return resolve(el.__rive.r);

      loadRiveScriptOnce()
        .then(() => {
          if (el.closest('.w-tab-pane') && !el.closest('.w--tab-active')) {
            el.__rive = { builtWhileHidden: true };
            return resolve(null);
          }
          const src = el.getAttribute('data-rive-src');
          if (!src) return resolve(null);
          const canvas = ensureCanvas(el);
          const rive = window.rive;
          if (!rive) return resolve(null);
          try {
            const instance = new rive.Rive({
              src,
              canvas,
              autoplay: false,
              layout: new rive.Layout({
                fit: rive.Fit.cover,
                alignment: rive.Alignment.center,
              }),
              onLoad: () => {
                const sms = getStateMachines(instance);
                const anims = getAnimationNames(instance);
                const sm = sms.length ? sms[0] : null;
                /* eslint-disable no-console -- log Rive duration for debugging */
                let totalDurationSec = 0;
                const animsMap = instance.animations;
                if (anims.length && animsMap) {
                  anims.forEach((name) => {
                    const anim =
                      typeof animsMap.get === 'function' ? animsMap.get(name) : animsMap[name];
                    const sec = anim?.duration != null ? Number(anim.duration) : 0;
                    if (sec > 0) {
                      totalDurationSec += sec;
                      console.log(`[Rive] ${src} — "${name}": ${sec}s`);
                    }
                  });
                  if (totalDurationSec > 0) {
                    console.log(
                      `[Rive] ${src} — total timeline duration: ${totalDurationSec.toFixed(2)}s`
                    );
                  }
                }
                if (sm && totalDurationSec === 0) {
                  console.log(`[Rive] ${src} — state machine: "${sm}" (no timeline durations)`);
                }
                /* eslint-enable no-console */
                el.__rive = {
                  r: instance,
                  sm,
                  anims,
                  totalDurationSec: totalDurationSec > 0 ? totalDurationSec : null,
                  inputs:
                    sm && typeof instance.stateMachineInputs === 'function'
                      ? instance.stateMachineInputs(sm) || []
                      : [],
                  isPlaying: false,
                  hasPlayed: false,
                  raf: null,
                  builtWhileHidden: false,
                  delayTimeout: null,
                };
                activeHosts.add(el);
                resolve(instance);
              },
            });
          } catch (err) {
            handleError(err, 'Rive Build');
            resolve(null);
          }
        })
        .catch(() => resolve(null));
    });

  const processBuildQueue = () => {
    if (building || !buildQueue.length) return;
    const { el, resolve, reject } = buildQueue.shift();
    building = true;
    doBuild(el).then(
      (r) => {
        resolve(r);
        building = false;
        processBuildQueue();
      },
      (err) => {
        reject(err);
        building = false;
        processBuildQueue();
      }
    );
  };

  const build = (el) => {
    if (el.__rive?.r) return Promise.resolve(el.__rive.r);
    return new Promise((resolve, reject) => {
      buildQueue.push({ el, resolve, reject });
      processBuildQueue();
    });
  };

  const stopAndReset = (el) => {
    const data = el.__rive;
    if (!data?.r) return;
    clearDelayTimer(el);
    cancelAnimationFrame(data.raf);
    data.raf = null;
    data.r.stop?.();
    data.r.reset?.();
    data.r.seek?.(0);
    data.r.advance?.(0);
    data.isPlaying = false;
    data.hasPlayed = false;
    const c = el.querySelector('canvas');
    if (c) c.style.opacity = '0';
  };

  const playOnce = (el, force = false) => {
    const data = el.__rive;
    if (!data?.r || (data.hasPlayed && !force)) return;

    resizeHost(el);

    // Always start animation from the beginning
    try {
      data.r.stop?.();
      data.r.reset?.();
      data.r.seek?.(0);
      data.r.advance?.(0);
    } catch (_) {}

    data.inputs?.forEach((input) => {
      try {
        if (typeof input.fire === 'function') input.fire();
        else if (typeof input.value === 'boolean') {
          input.value = true;
          setTimeout(() => (input.value = false), 600);
        } else if (typeof input.value === 'number') {
          input.value = input.value || 1;
        }
      } catch (_) {}
    });

    data.isPlaying = true;
    data.hasPlayed = true;

    const canvas = el.querySelector('canvas');
    if (canvas) {
      canvas.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          canvas.style.opacity = '1';
        });
      });
    }

    if (data.sm) data.r.play(data.sm);
    else if (data.anims?.length) data.r.play(data.anims[0]);
    else data.r.play?.();
  };

  const schedulePlay = (el, force = false) => {
    const data = el.__rive;
    if (!data?.r || (data.hasPlayed && !force)) return;
    clearDelayTimer(el);
    const delay = getDelayMs(el);
    if (delay <= 0) return playOnce(el, force);

    data.delayTimeout = setTimeout(() => {
      data.delayTimeout = null;
      const pane = el.closest('.w-tab-pane');
      const paneActive = !pane || pane.classList.contains('w--tab-active');
      const rect = el.getBoundingClientRect();
      const intersecting =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth);
      if (paneActive && intersecting) playOnce(el, force);
    }, delay);
  };

  let pending = [];
  const handleEntry = (entry) => {
    const el = entry.target;
    const ratio = Math.max(0, Math.min(1, entry.intersectionRatio || 0));
    if (el.closest('.w-tab-pane') && !el.closest('.w--tab-active')) {
      stopAndReset(el);
      return;
    }
    // Accordion-controlled: only play when data-accordion-img="active"
    if (el.hasAttribute('data-accordion-img')) {
      if (!isAccordionActive(el)) {
        if (ratio === 0) stopAndReset(el);
        return;
      }
    }
    if (ratio >= PLAY_THRESHOLD) {
      if (el.__rive?.r) schedulePlay(el);
      else build(el).then(() => schedulePlay(el));
    } else if (ratio === 0) {
      stopAndReset(el);
    }
  };

  // Check if element is in viewport with at least PLAY_THRESHOLD visibility (for immediate load when already visible)
  const isInView = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const visibleTop = Math.max(0, rect.top);
    const visibleLeft = Math.max(0, rect.left);
    const visibleBottom = Math.min(vh, rect.bottom);
    const visibleRight = Math.min(vw, rect.right);
    const visibleW = Math.max(0, visibleRight - visibleLeft);
    const visibleH = Math.max(0, visibleBottom - visibleTop);
    const visibleArea = visibleW * visibleH;
    const totalArea = rect.width * rect.height;
    const ratio = totalArea > 0 ? visibleArea / totalArea : 0;
    return ratio >= PLAY_THRESHOLD;
  };

  const checkAlreadyVisible = (el) => {
    if (el.closest('.w-tab-pane') && !el.closest('.w--tab-active')) return;
    if (el.hasAttribute('data-accordion-img') && !isAccordionActive(el)) return;
    if (!isInView(el)) return;
    if (el.__rive?.r) schedulePlay(el);
    else build(el).then(() => schedulePlay(el));
  };

  io = new IntersectionObserver(
    (entries) => {
      pending.push(...entries);
      if (pending.length && !io._raf) {
        io._raf = requestAnimationFrame(() => {
          const batch = pending;
          pending = [];
          io._raf = null;
          batch.forEach(handleEntry);
        });
      }
    },
    { threshold: [0, PLAY_THRESHOLD, 1] }
  );

  const activatePane = (pane) => {
    if (!pane) return;
    pane.parentNode.querySelectorAll('.w-tab-pane').forEach((sib) => {
      if (sib === pane) return;
      sib.querySelectorAll('[data-rive-src]').forEach((h) => {
        io.unobserve(h);
        stopAndReset(h);
      });
    });
    pane.querySelectorAll('[data-rive-src]').forEach((h) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(async () => {
          if (h.__rive?.builtWhileHidden) destroyHost(h);
          await build(h);
          io.observe(h);
        })
      );
    });
  };

  document.querySelectorAll('.w-tab-content').forEach((wrap) => {
    const mo = new MutationObserver(() => {
      const activePane = wrap.querySelector('.w-tab-pane.w--tab-active');
      if (activePane) {
        requestAnimationFrame(() => requestAnimationFrame(() => activatePane(activePane)));
      }
    });
    mo.observe(wrap, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    tabObservers.push(mo);
    const initial = wrap.querySelector('.w--tab-active');
    if (initial) activatePane(initial);
  });

  const init = () => {
    document.querySelectorAll('[data-rive-src]').forEach((el) => {
      const parentPane = el.closest('.w-tab-pane');
      if (parentPane && !parentPane.classList.contains('w--tab-active')) {
        el.__rive = { builtWhileHidden: true };
      } else {
        io.observe(el);
        // Hero / above-the-fold: IO may not fire immediately for already-visible elements
        requestAnimationFrame(() => checkAlreadyVisible(el));
      }
    });
    // Observe data-accordion-img: play when "active", stop when not
    document.querySelectorAll('[data-rive-src][data-accordion-img]').forEach((el) => {
      const mo = new MutationObserver(() => {
        if (el.getAttribute('data-accordion-img') === 'active') {
          if (el.__rive?.r) schedulePlay(el, true);
          else build(el).then(() => schedulePlay(el, true));
        } else {
          stopAndReset(el);
        }
      });
      mo.observe(el, { attributes: true, attributeFilter: ['data-accordion-img'] });
      accordionObservers.push(mo);
    });
    // Preload accordion Rive assets in idle time (don't play until data-accordion-img=active)
    const preloadAccordionRives = () => {
      document.querySelectorAll('[data-rive-src][data-accordion-img]').forEach((el) => {
        if (!el.__rive?.r) build(el);
      });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(preloadAccordionRives, { timeout: 4000 });
    } else {
      setTimeout(preloadAccordionRives, 500);
    }
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 200);
  }

  ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target;
      if (el.closest('.w-tab-pane') && !el.closest('.w--tab-active')) continue;
      resizeHost(el);
    }
  });
  document.querySelectorAll('[data-rive-src]').forEach((el) => ro.observe(el));

  logger.log('🎬 Rive initialized');
}

/**
 * Initialize Rive. Attaches bootstrap listeners (scroll, mousemove, etc.)
 * so Rive runs on first user interaction. If any host has data-load="eager",
 * Rive loads immediately on page load.
 */
export function initRive() {
  if (typeof document === 'undefined') return;

  const hosts = document.querySelectorAll('[data-rive-src]');
  if (!hosts.length) return;

  const hasEager = Array.from(hosts).some((el) => el.getAttribute('data-load') === 'eager');
  if (hasEager) {
    initRiveScript();
    return;
  }

  const riveEvents = ['scroll', 'mousemove', 'touchstart', 'pointerdown'];
  riveEvents.forEach((event) => {
    window.addEventListener(event, initRiveScript, { once: true, passive: true });
    document.addEventListener(event, initRiveScript, { once: true, passive: true });
  });
}

/**
 * Clean up Rive: reset flag, remove listeners, destroy hosts, disconnect observers.
 */
export function cleanupRive() {
  window.riveScriptInitialized = false;
  riveScriptPromise = null;
  cleanupRiveListeners();

  tabObservers.forEach((mo) => mo.disconnect());
  tabObservers = [];
  accordionObservers.forEach((mo) => mo.disconnect());
  accordionObservers = [];

  document.querySelectorAll('[data-rive-src]').forEach((el) => {
    const data = el.__rive;
    if (data?.r) {
      try {
        data.r.cleanup?.();
      } catch (_) {}
      clearTimeout(data?.delayTimeout);
      if (data?.raf) cancelAnimationFrame(data.raf);
    }
    el.__rive = null;
    el.querySelector('canvas')?.remove();
  });
  activeHosts.clear();

  if (io) {
    io.disconnect();
    io = null;
  }
  if (ro) {
    ro.disconnect();
    ro = null;
  }

  logger.log('🧹 Rive cleanup complete');
}
