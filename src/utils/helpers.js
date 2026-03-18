import { logger } from './logger';
import { getLenis } from '../global/lenis';

const smoothScrollHandlers = new WeakMap();

/**
 * Utility functions for Webflow projects
 *
 * Helpers:
 * - safeJSONParse(json, default): parse JSON with fallback + warnings.
 * - safeParseFloat(value, default): parse float with fallback.
 * - safeParseInt(value, default): parse int with fallback.
 * - debounce(fn, wait): debounce calls.
 * - throttle(fn, limit): throttle calls.
 * - rafThrottle(fn): throttle with requestAnimationFrame.
 * - isInViewport(el, offset): viewport check with offset.
 * - observeInView(elements, cb, options): IO observer + fallback.
 * - animateNumber(el, end, duration, start): count up animation.
 * - smoothScrollTo(el, target, offset, options): bind smooth scroll.
 * - lenisSmoothScrollTo(target, offset, options): scroll w/ Lenis.
 * - backToTop(options): scroll to top (Lenis or native).
 * - getQueryParams(): parse URL query string.
 * - waitForElement(selector, timeout): resolve when node appears.
 * - handleError(error, context, silent): centralized error handler.
 * - withErrorHandler(fn, context): wrap async with error handling.
 * - loadScript(src, options): load external scripts.
 * - appendElement(parent, child, options): append child to parent. options.emptyParent clears parent first.
 * - cloneAndAppend(parent, element, deep, options): clone node and append. options.emptyParent clears parent first.
 * - appendElementToAll(parents, element, deep, options): clone + append to each parent. options.emptyParent clears each first.
 * - appendAllToParent(parent, elements, options): append multiple elements to one parent. options.emptyParent clears parent first.
 */

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed value or default
 */
export function safeJSONParse(jsonString, defaultValue = {}) {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    // Validate that parsed value is an object (not null or array in malicious way)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    logger.warn('Failed to parse JSON:', error.message);
    return defaultValue;
  }
}

/**
 * Sanitize numeric attribute values
 * @param {string} value - The attribute value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Sanitized number
 */
export function safeParseFloat(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Sanitize integer attribute values
 * @param {string} value - The attribute value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Sanitized integer
 */
export function safeParseInt(value, defaultValue = 0) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to wait before allowing the next call
 * @returns {Function} - The throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * RequestAnimationFrame throttle - for scroll/resize handlers
 * More efficient than regular throttle for visual updates
 * @param {Function} func - The function to throttle
 * @returns {Function} - The RAF throttled function
 */
export function rafThrottle(func) {
  let ticking = false;
  return function executedFunction(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Check if an element is in viewport
 * @param {HTMLElement} element - The element to check
 * @param {number} offset - Offset in pixels
 * @returns {boolean} - True if element is in viewport
 */
export function isInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 - offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

/**
 * Observe element(s) entering the viewport and run a callback
 * @param {string|HTMLElement|NodeList|HTMLElement[]} elements - Target(s) to observe
 * @param {Function} callback - Runs with (element, entry)
 * @param {Object} options - IntersectionObserver options
 * @param {Element|null} [options.root=null] - Root element for observer
 * @param {string} [options.rootMargin='0px'] - Root margin for observer
 * @param {number|number[]} [options.threshold=0] - Intersection thresholds
 * @param {boolean} [options.once=true] - Unobserve after first entry
 * @param {number} [options.offset=0] - Fallback offset for viewport check
 * @returns {Function} Cleanup function to stop observing
 */
export function observeInView(elements, callback, options = {}) {
  if (typeof document === 'undefined') {
    return () => { };
  }

  const targets = resolveElementList(elements);
  if (!targets.length) {
    logger.warn('[observeInView] No elements found:', elements);
    return () => { };
  }

  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    once = true,
    offset = 0,
  } = options;

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          callback(entry.target, entry);
          if (once) {
            observer.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }

  // Fallback for older browsers without IntersectionObserver
  const remaining = new Set(targets);

  const checkInView = rafThrottle(() => {
    Array.from(remaining).forEach((target) => {
      if (!target) return;
      if (isInViewport(target, offset)) {
        callback(target, null);
        if (once) {
          remaining.delete(target);
        }
      }
    });
  });

  window.addEventListener('scroll', checkInView, { passive: true });
  window.addEventListener('resize', checkInView);
  checkInView();

  return () => {
    window.removeEventListener('scroll', checkInView);
    window.removeEventListener('resize', checkInView);
  };
}

/**
 * Animate a number from start to end
 * @param {HTMLElement} element - The element to update
 * @param {number} end - The target number
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} start - Starting number
 */
export function animateNumber(element, end, duration = 2000, start = 0) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = Math.floor(end);
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/**
 * Smooth scroll to an element
 * @param {string|HTMLElement} target - The target element or selector
 * @param {number} offset - Offset in pixels from the top
 */
/**
 * Attach Lenis-powered smooth scroll to one or more trigger elements.
 * @param {string|HTMLElement|NodeList|HTMLElement[]} element - Trigger(s) to bind
 * @param {string|HTMLElement|Function} target - Target selector/element or resolver fn
 * @param {number} offset - Additional offset in pixels (positive scrolls further up)
 * @param {Object} options - Extra Lenis scroll options
 * @returns {Function} Cleanup function to remove listeners
 */
export function smoothScrollTo(element, target, offset = 0, options = {}) {
  if (typeof document === 'undefined') {
    return () => { };
  }

  const triggers = resolveElementList(element);

  if (!triggers.length) {
    logger.warn('[smoothScrollTo] Trigger element(s) not found:', element);
    return () => { };
  }

  const handler = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    const resolvedTarget =
      typeof target === 'function' ? target(event, event?.currentTarget) : target;

    lenisSmoothScrollTo(resolvedTarget, offset, options);
  };

  triggers.forEach((trigger) => {
    const existingHandler = smoothScrollHandlers.get(trigger);
    if (existingHandler) {
      trigger.removeEventListener('click', existingHandler);
    }
    trigger.addEventListener('click', handler);
    smoothScrollHandlers.set(trigger, handler);
  });

  return () => {
    triggers.forEach((trigger) => {
      const savedHandler = smoothScrollHandlers.get(trigger);
      if (savedHandler) {
        trigger.removeEventListener('click', savedHandler);
        smoothScrollHandlers.delete(trigger);
      }
    });
  };
}

/**
 * Smooth scroll with Lenis when available (falls back to native smooth scroll)
 * @param {string|HTMLElement} target - The target element or selector
 * @param {number} offset - Additional offset in pixels (positive numbers move further up)
 * @param {Object} options - Extra Lenis scrollTo options
 */
export function lenisSmoothScrollTo(target, offset = 0, options = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  const element = resolveElement(target);

  if (!element) {
    logger.warn('[lenisSmoothScrollTo] Target not found:', target);
    return;
  }

  const lenis = getLenis();

  if (!lenis) {
    nativeScrollToElement(element, offset);
    return;
  }

  const navbar = document.querySelector('[data-navbar]');
  const navbarOffset = navbar ? navbar.offsetHeight : 0;

  const lenisOptions = {
    duration: 1.2,
    ...options,
  };

  if (typeof lenisOptions.offset !== 'number') {
    lenisOptions.offset = -(offset + navbarOffset);
  }

  lenis.scrollTo(element, lenisOptions);
}

function resolveElement(ref) {
  if (!ref || typeof document === 'undefined') return null;
  if (typeof ref === 'string') {
    return document.querySelector(ref);
  }
  if (ref === window || ref === document || ref === document.documentElement) {
    return document.documentElement;
  }
  if (isDomElement(ref)) {
    return ref;
  }
  return null;
}

function resolveElementList(ref) {
  if (!ref || typeof document === 'undefined') return [];

  if (typeof ref === 'string') {
    return Array.from(document.querySelectorAll(ref));
  }

  if (isDomElement(ref)) {
    return [ref];
  }

  if (typeof NodeList !== 'undefined' && ref instanceof NodeList) {
    return Array.from(ref).filter(isDomElement);
  }

  if (Array.isArray(ref)) {
    return ref.filter(isDomElement);
  }

  return [];
}

/**
 * Append a child element to a parent element
 * @param {string|HTMLElement} parent - Parent element or selector
 * @param {string|HTMLElement} child - Child element or selector
 * @param {{ emptyParent?: boolean }} [options] - emptyParent: clear parent before appending
 * @returns {HTMLElement|null} - Appended child element
 */
export function appendElement(parent, child, options = {}) {
  if (typeof document === 'undefined') return null;

  const parentElement = resolveElement(parent);
  const childElement = resolveElement(child);

  if (!parentElement) {
    logger.warn('[appendElement] Parent element not found:', parent);
    return null;
  }
  if (!childElement) {
    logger.warn('[appendElement] Child element not found:', child);
    return null;
  }

  if (options.emptyParent) parentElement.replaceChildren();
  parentElement.appendChild(childElement);
  return childElement;
}

/**
 * Clone an element and append it to a parent
 * @param {string|HTMLElement} parent - Parent element or selector
 * @param {string|HTMLElement} element - Element or selector to clone
 * @param {boolean} [deep=true] - Clone children as well
 * @param {{ emptyParent?: boolean }} [options] - emptyParent: clear parent before appending
 * @returns {HTMLElement|null} - Appended cloned element
 */
export function cloneAndAppend(parent, element, deep = true, options = {}) {
  if (typeof document === 'undefined') return null;

  const parentElement = resolveElement(parent);
  const sourceElement = resolveElement(element);

  if (!parentElement) {
    logger.warn('[cloneAndAppend] Parent element not found:', parent);
    return null;
  }
  if (!sourceElement) {
    logger.warn('[cloneAndAppend] Source element not found:', element);
    return null;
  }

  if (options.emptyParent) parentElement.replaceChildren();
  const clone = sourceElement.cloneNode(Boolean(deep));
  parentElement.appendChild(clone);
  return clone;
}

/**
 * Clone an element and append it to multiple parents
 * @param {string|HTMLElement|NodeList|HTMLElement[]} parents - Parent(s) or selector
 * @param {string|HTMLElement} element - Element or selector to clone
 * @param {boolean} [deep=true] - Clone children as well
 * @param {{ emptyParent?: boolean }} [options] - emptyParent: clear each parent before appending
 * @returns {HTMLElement[]} - Appended cloned elements
 */
export function appendElementToAll(parents, element, deep = true, options = {}) {
  if (typeof document === 'undefined') return [];

  const parentElements = resolveElementList(parents);
  const sourceElement = resolveElement(element);

  if (!parentElements.length) {
    logger.warn('[appendElementToAll] Parent elements not found:', parents);
    return [];
  }
  if (!sourceElement) {
    logger.warn('[appendElementToAll] Source element not found:', element);
    return [];
  }

  return parentElements.map((parent) => {
    if (options.emptyParent) parent.replaceChildren();
    const clone = sourceElement.cloneNode(Boolean(deep));
    parent.appendChild(clone);
    return clone;
  });
}

/**
 * Append multiple elements to a single parent (moves nodes into the parent)
 * @param {string|HTMLElement} parent - Parent element or selector
 * @param {string|NodeList|HTMLElement[]} elements - Child elements or selector (multiple match)
 * @param {{ emptyParent?: boolean }} [options] - emptyParent: clear parent before appending
 * @returns {HTMLElement|null} - The parent element, or null if parent/elements not found
 */
export function appendAllToParent(parent, elements, options = {}) {
  if (typeof document === 'undefined') return null;

  const parentElement = resolveElement(parent);
  const childElements = resolveElementList(elements);

  if (!parentElement) {
    logger.warn('[appendAllToParent] Parent not found:', parent);
    return null;
  }
  if (!childElements.length) {
    logger.warn('[appendAllToParent] No elements found:', elements);
    return null;
  }

  if (options.emptyParent) parentElement.replaceChildren();
  for (const el of childElements) {
    parentElement.appendChild(el);
  }
  return parentElement;
}

function nativeScrollToElement(target, offset = 0) {
  if (typeof window === 'undefined' || !target) {
    return;
  }

  const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const destination = elementPosition - offset;

  window.scrollTo({
    top: destination,
    behavior: 'smooth',
  });
}

function isDomElement(node) {
  return typeof Element !== 'undefined' && node instanceof Element;
}

/**
 * Scroll the window back to the top.
 * Uses Lenis smooth scroll when available with a native fallback.
 * @param {Object} options - Lenis scroll options or native behavior override.
 * @param {string} [options.behavior='smooth'] - Native scroll behavior fallback.
 */
export function backToTop(options = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const { behavior: nativeBehavior = 'smooth', ...lenisOptions } = options;

  const lenis = typeof getLenis === 'function' ? getLenis() : null;
  if (lenis) {
    lenis.scrollTo(0, {
      duration: 1.2,
      ...lenisOptions,
    });
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: nativeBehavior,
  });
}

/**
 * Get query parameters from URL
 * @returns {Object} - Object containing query parameters
 */
export function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });

  return params;
}

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - The selector to watch for
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<HTMLElement>} - Promise that resolves with the element
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Centralized error handler
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @param {boolean} silent - If true, only logs to console
 */
export function handleError(error, context = 'Application', silent = true) {
  const errorMessage = `[${context}] ${error.message || 'Unknown error'}`;

  // Log to console
  logger.error(errorMessage, error);

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });

  // Optionally show user-friendly message
  if (!silent && typeof window !== 'undefined') {
    // Could trigger a notification component here
    logger.warn('Error occurred:', errorMessage);
  }

  return error;
}

/**
 * Wrap async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error messages
 * @returns {Function} - Wrapped function
 */
export function withErrorHandler(fn, context = 'Function') {
  return async function (...args) {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };
}

/**
 * Load external script dynamically
 * @param {string} src - Script URL
 * @param {Object} options - Additional options
 * @returns {Promise} - Resolves when script is loaded
 */
export function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = options.async !== false; // Default to async
    script.defer = options.defer || false;

    if (options.id) {
      script.id = options.id;
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful
 */
async function copyToClipboard(text) {
  if (!text) {
    logger.warn('[copyToClipboard] No text provided');
    return false;
  }

  try {
    // Use modern Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (error) {
    logger.error('[copyToClipboard] Failed to copy text:', error);
    return false;
  }
}

/**
 * Find the closest element with an ID, starting from the given element
 * @param {HTMLElement} element - Starting element
 * @returns {HTMLElement|null} - Element with ID or null
 */
function findClosestElementWithId(element) {
  if (!element) return null;

  // Check the element itself
  if (element.id) {
    return element;
  }

  // Check parent elements
  let current = element.parentElement;
  while (current) {
    if (current.id) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Initialize copy link functionality for elements with [data-copy-link]
 * When clicked, copies the page URL with the element's ID as a hash fragment
 * @returns {Function} Cleanup function to remove listeners
 */
export function initCopyLink() {
  if (typeof document === 'undefined') {
    return () => { };
  }

  const handleCopyLink = async (event, element) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }

    if (!element) return;

    // Check if data-copy-link specifies a target selector
    const targetSelector = element.getAttribute('data-copy-link');
    let targetElement = null;

    if (targetSelector && targetSelector.trim() !== '') {
      // If data-copy-link has a value, use it as a selector
      targetElement = document.querySelector(targetSelector);
    } else {
      // Otherwise, find the closest element with an ID
      targetElement = findClosestElementWithId(element);
    }

    if (!targetElement || !targetElement.id) {
      logger.warn('[initCopyLink] No element with ID found for copy link');
      return;
    }

    // Build the URL with hash
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${targetElement.id}`;

    // Store original text content
    const originalText = element.textContent || element.innerText || '';

    // Get custom "copied" text and duration from data attributes, or use defaults
    const copiedText = element.getAttribute('data-copy-text') || 'Copied!';
    const duration = parseInt(element.getAttribute('data-copy-duration'), 10) || 2000;

    // Copy to clipboard
    const success = await copyToClipboard(url);

    if (success) {
      logger.log(`[initCopyLink] Copied URL to clipboard: ${url}`);

      // Change text content to "Copied!"
      element.textContent = copiedText;

      // Restore original text after duration
      setTimeout(() => {
        element.textContent = originalText;
      }, duration);

      // Optional: Trigger a custom event for UI feedback
      const copyEvent = new CustomEvent('linkCopied', {
        detail: { url, element: targetElement },
        bubbles: true,
      });
      element.dispatchEvent(copyEvent);
    } else {
      logger.warn('[initCopyLink] Failed to copy URL to clipboard');
    }
  };

  // Use event delegation for better performance
  const handleClick = (event) => {
    const copyLinkElement = event.target.closest('[data-copy-link]');
    if (copyLinkElement) {
      handleCopyLink(event, copyLinkElement);
    }
  };

  document.addEventListener('click', handleClick, { passive: false });

  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick);
  };
}
