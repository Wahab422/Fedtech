/**
 * Custom Load More (Shared Utility)
 * Reveals items in batches inside a list container.
 *
 * Webflow Setup:
 * - List wrapper: data-custom-loadmore="list"
 * - Button inside list: data-custom-loadmore="btn"
 * - Optional: data-custom-loadmore="item" on each item
 *
 * Options (on list wrapper):
 * - data-custom-loadmore-initial="3"  Number of items visible on load
 * - data-custom-loadmore-step="3"     Items to reveal per click
 * - data-loadmore-initial="3"         Clear alias for initial visible count
 * - data-loadmore-step="3"            Clear alias for items revealed per click
 * - initial-load-items="3"           Alias for initial visible count
 * - load-no-of-items="3"             Alias for items revealed per click
 *
 * Animation:
 * - Uses GSAP (if available) to reveal items with a stagger.
 */

import { logger } from '../utils/logger';

const instances = new Map();
const SELECTORS = {
  root: '[data-custom-loadmore="list"]',
  button: '[data-custom-loadmore="btn"]',
  item: '[data-custom-loadmore="item"]',
};

function parsePositiveInt(value, fallback) {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function getAttrValue(el, names) {
  for (const name of names) {
    const value = el.getAttribute(name);
    if (value !== null && value !== '') return value;
  }
  return null;
}

function setHidden(el, hidden) {
  el.hidden = hidden;
  if (hidden) {
    el.setAttribute('aria-hidden', 'true');
  } else {
    el.removeAttribute('aria-hidden');
  }
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateReveal(items, reducedMotion) {
  if (!items.length) return;
  const useGSAP = typeof window !== 'undefined' && window.gsap;
  if (!useGSAP) return;

  const duration = reducedMotion ? 0.2 : 0.5;
  const stagger = reducedMotion ? 0.03 : 0.08;
  const fromY = reducedMotion ? 0 : 16;
  const fromBlur = reducedMotion ? 0 : 8;

  window.gsap.fromTo(
    items,
    {
      opacity: 0,
      y: fromY,
      filter: `blur(${fromBlur}px)`,
    },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease: 'power2.out',
      overwrite: 'auto',
    }
  );
}

function getItems(root, button) {
  const markedItems = Array.from(root.querySelectorAll(SELECTORS.item));
  if (markedItems.length) return markedItems;

  return Array.from(root.children).filter((child) => child !== button);
}

function createInstance(root) {
  const button = root.querySelector(SELECTORS.button);
  if (!button) return null;

  const reducedMotion = prefersReducedMotion();
  const items = getItems(root, button);
  if (!items.length) {
    button.style.display = 'none';
    return null;
  }

  const initialCount = parsePositiveInt(
    getAttrValue(root, [
      'data-custom-loadmore-initial',
      'data-loadmore-initial',
      'initial-load-items',
      'data-initial-load-items',
    ]),
    3
  );
  const stepCount = parsePositiveInt(
    getAttrValue(root, [
      'data-custom-loadmore-step',
      'data-loadmore-step',
      'load-no-of-items',
      'data-load-no-of-items',
    ]),
    initialCount
  );

  let visibleCount = Math.min(initialCount, items.length);

  items.forEach((item, index) => {
    setHidden(item, index >= visibleCount);
  });

  if (visibleCount >= items.length) {
    button.style.display = 'none';
    return null;
  }

  const onClick = (event) => {
    event.preventDefault();

    const nextCount = Math.min(visibleCount + stepCount, items.length);
    const newlyRevealed = [];
    for (let i = visibleCount; i < nextCount; i += 1) {
      setHidden(items[i], false);
      newlyRevealed.push(items[i]);
    }
    visibleCount = nextCount;

    animateReveal(newlyRevealed, reducedMotion);

    if (visibleCount >= items.length) {
      button.style.display = 'none';
    }
  };

  button.addEventListener('click', onClick);

  return () => {
    button.removeEventListener('click', onClick);
  };
}

export function initListLoadMore(options = {}) {
  if (typeof document === 'undefined') {
    logger.warn('[LoadMore] document is undefined (SSR) - skipping init.');
    return () => {};
  }

  const roots =
    options.rootElements ||
    Array.from(document.querySelectorAll(options.rootSelector || SELECTORS.root));

  if (!roots.length) {
    logger.info('[LoadMore] No lists found - nothing to initialize.');
    return () => {};
  }

  let initializedCount = 0;

  roots.forEach((root) => {
    if (instances.has(root)) return;
    const cleanup = createInstance(root);
    if (cleanup) {
      instances.set(root, cleanup);
      initializedCount += 1;
    }
  });

  if (initializedCount > 0) {
    logger.log(`📦 Load more ready (${initializedCount} instance${initializedCount > 1 ? 's' : ''})`);
  }

  return () => cleanupListLoadMore();
}

export function cleanupListLoadMore() {
  instances.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      logger.warn('[LoadMore] Cleanup error:', error);
    }
  });
  instances.clear();
}
