import { getLenis } from '../global/lenis';
import { logger } from '../utils/logger';

const DEFAULT_OPTIONS = {
  rootSelector: '.program-card__wrap',
  linkSelector: '.program-link a[href*="#"], .program-link-text[href*="#"]',
  innerSelector: '.program-link__inner, .program-link-text',
  activeClass: 'w--current',
  ariaCurrentValue: 'location',
  offset: 16,
  scrollOffset: 0,
  /** Match Lenis default in `lenis.js` so TOC clicks animate like other in-page links */
  scrollDuration: 1.2,
  useProgress: true,
  progressVarName: '--toc-progress',
  /** Applied to `.program-link__inner` for sections above the current one (typography only; no filled bars). */
  pastClass: 'is-toc-past',
  observerThreshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
};

const HASH_PREFIX_REGEX = /^.*?#/;

export function initProgramToc(options = {}) {
  if (typeof document === 'undefined') return () => {};

  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const roots = Array.from(document.querySelectorAll(config.rootSelector));
  if (!roots.length) return () => {};

  const cleanups = roots
    .map((root) => createTocInstance(root, config))
    .filter((cleanup) => typeof cleanup === 'function');

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function createTocInstance(root, config) {
  const links = Array.from(root.querySelectorAll(config.linkSelector));
  if (!links.length) return () => {};

  const sectionMap = buildSectionMap();
  const linkItems = links
    .map((link) => preprocessLinkTarget(link, root, config, sectionMap))
    .filter(Boolean);

  if (!linkItems.length) {
    logger.warn('[ToC] No valid target sections found for ToC links.');
    return () => {};
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('is-toc-ready');
  if (prefersReducedMotion) {
    root.classList.add('is-reduced-motion');
  }

  let activeLink = null;
  let observer = null;
  let ticking = false;
  let lenisUnsubscribe = null;

  /** Viewport Y of the “reading line” (always below nav). Offset anchors only change Lenis scroll offset, not this line. */
  const readingLineY = () => getActivationLine(config.offset, true);

  const setActive = (nextLink) => {
    if (activeLink === nextLink) return;

    linkItems.forEach(({ link, inner }) => {
      if (link !== nextLink) {
        link.removeAttribute('aria-current');
        inner.classList.remove(config.activeClass);
      }
    });

    if (!nextLink) {
      activeLink = null;
      return;
    }

    const next = linkItems.find((item) => item.link === nextLink);
    if (!next) return;

    next.link.setAttribute('aria-current', config.ariaCurrentValue);
    next.inner.classList.add(config.activeClass);
    activeLink = next.link;
  };

  const pickActiveItem = (lineY) => {
    let idx = 0;
    for (let i = 0; i < linkItems.length; i += 1) {
      const rect = linkItems[i].target.getBoundingClientRect();
      if (rect.top <= lineY) idx = i;
    }
    return linkItems[idx] || null;
  };

  const updateByViewport = () => {
    const candidate = pickActiveItem(readingLineY());
    setActive(candidate?.link || null);
  };

  const progressHost = (item) => item.progressHost || item.inner;

  /**
   * One “active” row: partial fill only there. Sections already passed get `pastClass` on the inner link only.
   * Last TOC row has no border (CSS); progress is never drawn for it.
   */
  const updateProgressAndPast = () => {
    const activeIndex = linkItems.findIndex((item) => item.link === activeLink);
    const lineY = readingLineY();
    const lastIndex = linkItems.length - 1;

    for (let i = 0; i < linkItems.length; i += 1) {
      const current = linkItems[i];
      const { inner } = current;
      const host = progressHost(current);
      const isLast = i === lastIndex;

      if (activeIndex >= 0 && i < activeIndex) {
        inner.classList.add(config.pastClass);
      } else {
        inner.classList.remove(config.pastClass);
      }

      if (!config.useProgress || isLast) {
        host.style.setProperty(config.progressVarName, '0');
        continue;
      }

      const next = linkItems[i + 1];
      const s0 = current.target.getBoundingClientRect().top;
      const s1 = next
        ? next.target.getBoundingClientRect().top
        : document.documentElement.getBoundingClientRect().bottom;

      const range = Math.max(1, s1 - s0);
      const rawProgress = (lineY - s0) / range;
      const progress = clamp(rawProgress, 0, 1);

      if (current.link === activeLink) {
        host.style.setProperty(config.progressVarName, String(progress));
      } else {
        host.style.setProperty(config.progressVarName, '0');
      }
    }
  };

  const queueSync = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateByViewport();
      updateProgressAndPast();
    });
  };

  const onClickHandlers = linkItems.map((item) => {
    const handler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setActive(item.link);

      const targetIsOffsetAnchor =
        item.target.classList.contains('offset-link') ||
        item.target.hasAttribute('data-scroll-offset-anchor');

      scrollToTarget(item.target, {
        duration: config.scrollDuration,
        offset: config.scrollOffset,
        includeNavbarOffset: !targetIsOffsetAnchor,
        prefersReducedMotion,
      });
    };
    item.link.addEventListener('click', handler);
    return () => item.link.removeEventListener('click', handler);
  });

  observer = new IntersectionObserver(
    () => {
      queueSync();
    },
    {
      root: null,
      rootMargin: `-${Math.round(readingLineY())}px 0px -35% 0px`,
      threshold: config.observerThreshold,
    }
  );

  linkItems.forEach((item) => observer.observe(item.target));

  window.addEventListener('scroll', queueSync, { passive: true });
  window.addEventListener('resize', queueSync);

  const attachLenisScroll = () => {
    const lenis = getLenis();
    if (!lenis || typeof lenis.on !== 'function') return null;
    const onLenisScroll = () => queueSync();
    lenis.on('scroll', onLenisScroll);
    if (typeof lenis.off === 'function') {
      return () => lenis.off('scroll', onLenisScroll);
    }
    return () => {};
  };

  lenisUnsubscribe = attachLenisScroll();

  let lenisPollCount = 0;
  const lenisPollMax = 50;
  const lenisPollId = window.setInterval(() => {
    if (lenisUnsubscribe) {
      window.clearInterval(lenisPollId);
      return;
    }
    lenisPollCount += 1;
    if (lenisPollCount > lenisPollMax) {
      window.clearInterval(lenisPollId);
      return;
    }
    const unsub = attachLenisScroll();
    if (unsub) {
      lenisUnsubscribe = unsub;
      window.clearInterval(lenisPollId);
    }
  }, 100);

  queueSync();

  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    onClickHandlers.forEach((off) => off());
    window.removeEventListener('scroll', queueSync);
    window.removeEventListener('resize', queueSync);
    window.clearInterval(lenisPollId);
    if (lenisUnsubscribe) {
      lenisUnsubscribe();
      lenisUnsubscribe = null;
    }
    linkItems.forEach((item) => {
      const { link, inner } = item;
      link.removeAttribute('aria-current');
      inner.classList.remove(config.activeClass, config.pastClass);
      progressHost(item).style.removeProperty(config.progressVarName);
    });
  };
}

function preprocessLinkTarget(link, root, config, sectionMap) {
  const href = link.getAttribute('href') || '';
  const hash = extractHash(href);
  if (!hash) return null;

  const target = resolveTarget(hash, sectionMap);
  if (!target) {
    logger.warn('[ToC] Target not found for hash:', hash);
    return null;
  }

  if (!target.id) {
    target.id = slugify(hash.replace(/^#/, '')) || `toc-section-${Date.now()}`;
  }

  const canonicalHref = `#${target.id}`;
  link.setAttribute('href', canonicalHref);
  link.dataset.tocTarget = target.id;

  const inner = resolveInnerElement(link, config.innerSelector);

  // Keep nav labels wired for assistive tech even if we canonicalize href for Lenis.
  if (!link.hasAttribute('aria-label')) {
    const text = (link.textContent || '').trim();
    if (text) link.setAttribute('aria-label', text);
  }

  if (!root.contains(link)) return null;

  const wrap = link.closest('.program-link');
  const progressHost = wrap instanceof Element ? wrap : inner;

  return {
    link,
    inner,
    target,
    wrap,
    progressHost,
  };
}

function buildSectionMap() {
  const byId = new Map();
  const allWithId = Array.from(document.querySelectorAll('[id]'));

  allWithId.forEach((el) => {
    const id = (el.id || '').trim();
    if (!id) return;

    const normalizedId = normalizeHash(id);
    const slugId = slugify(id);

    if (normalizedId && !byId.has(normalizedId)) byId.set(normalizedId, el);
    if (slugId && !byId.has(slugId)) byId.set(slugId, el);
  });

  return byId;
}

function resolveTarget(hash, sectionMap) {
  const normalized = normalizeHash(hash);
  if (normalized && sectionMap.has(normalized)) return sectionMap.get(normalized);

  const decoded = decodeHash(hash);
  const decodedNorm = normalizeHash(decoded);
  if (decodedNorm && sectionMap.has(decodedNorm)) return sectionMap.get(decodedNorm);

  const slug = slugify(decoded || hash);
  if (slug && sectionMap.has(slug)) return sectionMap.get(slug);

  const clean = (decoded || hash).replace(/^#/, '');
  const direct = document.getElementById(clean);
  if (direct) return direct;

  return null;
}

function extractHash(href) {
  if (!href) return '';
  if (href.startsWith('#')) return href;
  if (href.includes('#')) return `#${href.replace(HASH_PREFIX_REGEX, '')}`;
  return '';
}

function normalizeHash(value) {
  if (!value) return '';
  return String(value).trim().replace(/^#/, '').toLowerCase();
}

function decodeHash(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch (_) {
    return String(value || '');
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[\u2019'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getActivationLine(customOffset = 0, includeNavbarOffset = true) {
  if (!includeNavbarOffset) return customOffset;
  const navbar = document.querySelector('.nav') || document.querySelector('[data-navbar]');
  const navbarHeight = navbar ? navbar.offsetHeight : 0;
  return navbarHeight + customOffset;
}

function resolveInnerElement(link, fallbackSelector) {
  const preferred = link.closest('.program-link__inner');
  if (preferred) return preferred;

  if (link.matches('.program-link-text')) return link;

  if (fallbackSelector) {
    const matched = link.closest(fallbackSelector);
    if (matched) return matched;
  }

  return link;
}

function scrollToTarget(target, options = {}) {
  if (!target || typeof window === 'undefined') return;

  const includeNavbarOffset = options.includeNavbarOffset !== false;
  const baseOffset = options.offset || 0;
  const offset = includeNavbarOffset ? getActivationLine(baseOffset) : baseOffset;
  const lenis = getLenis();
  const prefersReducedMotion = Boolean(options.prefersReducedMotion);

  if (lenis) {
    lenis.scrollTo(target, {
      offset: -offset,
      duration: prefersReducedMotion ? 0 : (options.duration ?? 1),
      immediate: prefersReducedMotion,
    });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
