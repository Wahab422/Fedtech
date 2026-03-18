/**
 * Unicorn Studio Embed Component
 * Lazy-loads Unicorn Studio SDK, applies device-tuned defaults,
 * and initializes embeds when they near the viewport.
 *
 * Usage:
 * 1) Import: import { initUnicornEmbeds } from '../components/unicorn';
 * 2) Call initUnicornEmbeds() after DOM is ready on pages that use .unicorn-embed
 *
 * Attributes:
 * - data-us-priority="true"   Load immediately (skip idle/viewport delay)
 */

import { handleError } from '../utils/helpers';

const SDK_VERSION = 'v2.0.2';
const SDK_SRC =
  'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.2/dist/unicornStudio.umd.js';

let initialized = false;
let observer = null;
let sdkPromise = null;
let embedLoadObservers = [];

function loadSdk() {
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    if (window.UnicornStudio) {
      resolve();
      return;
    }

    // Prevent double-injection
    let script = document.querySelector(`script[data-us-sdk="${SDK_VERSION}"]`);
    if (script) {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', reject, { once: true });
      return;
    }

    script = document.createElement('script');
    script.setAttribute('data-us-sdk', SDK_VERSION);
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    (document.head || document.body).appendChild(script);
  });

  return sdkPromise;
}

function markWrapLoaded(embed) {
  const wrap = embed?.closest?.('.unicorn-wrap');
  if (wrap) {
    wrap.classList.add('is-loaded');
  } else if (embed) {
    embed.classList.add('is-loaded');
  }
}

function isPriorityEmbed(embed) {
  return embed?.getAttribute?.('data-us-priority') === 'true';
}

function watchEmbedLoaded(embed) {
  if (!embed || embed.dataset.usLoadedObserver === 'true') {
    return;
  }

  embed.dataset.usLoadedObserver = 'true';

  if (embed.childElementCount > 0) {
    markWrapLoaded(embed);
    return;
  }

  const mo = new MutationObserver(() => {
    if (embed.childElementCount > 0) {
      markWrapLoaded(embed);
      mo.disconnect();
    }
  });

  mo.observe(embed, { childList: true, subtree: true });
  embedLoadObservers.push(mo);
}

function initOnce(embeds, { priority = false } = {}) {
  if (initialized) return;
  initialized = true;

  const run = () => {
    loadSdk()
      .then(() => {
        if (window.UnicornStudio?.init) {
          return window.UnicornStudio.init();
        }
        return null;
      })
      .then(() => {
        embeds?.forEach?.((embed) => markWrapLoaded(embed));
      })
      .catch((error) => handleError(error, 'UnicornStudio Init'));
  };

  if (priority) {
    run();
    return;
  }

  // Reduce main-thread competition during scroll
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 200);
  }
}

export function initUnicornEmbeds() {
  if (typeof document === 'undefined') {
    return () => { };
  }

  const embeds = document.querySelectorAll('.unicorn-embed');
  if (!embeds.length) {
    return () => { };
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => { };
  }

  // Device tuning
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const priorityEmbeds = [];

  embeds.forEach((el) => {
    const isPriority = isPriorityEmbed(el);

    if (!el.getAttribute('data-us-dpi')) {
      el.setAttribute('data-us-dpi', isMobile ? '1' : '1.5');
    }
    if (!el.getAttribute('data-us-fps')) {
      el.setAttribute('data-us-fps', '30');
    }
    if (!el.getAttribute('data-us-scale')) {
      el.setAttribute('data-us-scale', '0.7');
    }
    if (!el.getAttribute('data-us-production')) {
      el.setAttribute('data-us-production', 'true');
    }
    if (isPriority) {
      priorityEmbeds.push(el);
      el.setAttribute('data-us-lazyload', 'false');
    } else if (!el.getAttribute('data-us-lazyload')) {
      el.setAttribute('data-us-lazyload', 'true');
    }

  });

  embedLoadObservers.forEach((mo) => mo.disconnect());
  embedLoadObservers = [];
  embeds.forEach((el) => watchEmbedLoaded(el));

  if (priorityEmbeds.length > 0) {
    initOnce(embeds, { priority: true });
    return () => { };
  }

  if (!('IntersectionObserver' in window)) {
    initOnce(embeds);
    return () => { };
  }

  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        initOnce(embeds);
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: '300px' }
  );

  embeds.forEach((el) => observer.observe(el));

  return () => {
    observer?.disconnect();
    observer = null;
    embedLoadObservers.forEach((mo) => mo.disconnect());
    embedLoadObservers = [];
  };
}
