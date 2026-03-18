import { logger } from './logger';

/**
 * Performance Utilities
 * Helper functions for optimizing performance
 */

// Re-export utilities from helpers.js to maintain backward compatibility
export { debounce, throttle, rafThrottle, isInViewport } from './helpers';

/**
 * Lazy load components - only load when needed
 * @param {Function} importFunc - Dynamic import function
 * @returns {Promise} - Promise that resolves with the module
 */
export async function lazyLoad(importFunc) {
  try {
    const module = await importFunc();
    return module;
  } catch (error) {
    logger.error('Error lazy loading module:', error);
    throw error;
  }
}

/**
 * Intersection Observer helper - for lazy loading
 * @param {Function} callback - Function to call when element is visible
 * @param {Object} options - IntersectionObserver options
 * @returns {IntersectionObserver} - The observer instance
 */
export function createObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Preload image
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} - Promise that resolves with loaded image
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch DOM reads to avoid layout thrashing
 * @param {Function} readFunc - Function that reads DOM properties
 * @returns {Promise} - Promise that resolves with the read value
 */
export function batchRead(readFunc) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve(readFunc());
    });
  });
}

/**
 * Batch DOM writes to avoid layout thrashing
 * @param {Function} writeFunc - Function that writes to DOM
 * @returns {Promise} - Promise that resolves after write
 */
export function batchWrite(writeFunc) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      writeFunc();
      resolve();
    });
  });
}

/**
 * Monitor performance metrics
 * @param {string} name - Name of the measurement
 * @param {Function} func - Function to measure
 * @returns {*} - Return value of the function
 */
export async function measurePerformance(name, func) {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  performance.mark(startMark);
  const result = await func();
  performance.mark(endMark);

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    logger.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  } catch (e) {
    // Performance API not available
  }

  return result;
}
