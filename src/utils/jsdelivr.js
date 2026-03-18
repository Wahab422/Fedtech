/**
 * jsDelivr CDN Configuration and Utilities
 * Centralized management for all CDN library loading
 * Documentation: https://www.jsdelivr.com/
 */

import { loadScript, handleError } from './helpers';
import { logger } from './logger';

/**
 * jsDelivr CDN Library Configuration
 * Add your libraries here with their versions
 */
export const jsDelivrLibraries = {
  // Animation Libraries
  gsap: {
    version: '3.12.5',
    js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
    css: null,
  },
  scrollTrigger: {
    version: '3.12.5',
    js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
    css: null,
    dependsOn: ['gsap'],
  },
  splitText: {
    version: '3.12.5',
    js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js',
    css: null,
    dependsOn: ['gsap'],
  },
  customEase: {
    version: '3.12.5',
    js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/CustomEase.min.js',
    css: null,
    dependsOn: ['gsap'],
  },

  // Carousel/Slider Libraries
  swiper: {
    version: '11',
    js: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    // css: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  },
  embla: {
    version: 'latest',
    js: 'https://cdn.jsdelivr.net/npm/embla-carousel/embla-carousel.umd.js',
    css: null,
  },

  // Add more libraries as needed
  // Example:
  // lodash: {
  //   version: '4.17.21',
  //   js: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  //   css: null,
  // },
};

/**
 * Track loaded libraries to prevent duplicate loading
 */
const loadedLibraries = new Set();

/**
 * Load CSS from jsDelivr CDN
 * @param {string} cssUrl - CSS file URL
 * @param {string} id - Optional ID for the link element
 * @returns {Promise<void>}
 */
export function loadCSS(cssUrl, id = null) {
  return new Promise((resolve, reject) => {
    // Check if CSS already loaded
    const existingLink = id
      ? document.querySelector(`link#${id}`)
      : document.querySelector(`link[href="${cssUrl}"]`);

    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;

    if (id) {
      link.id = id;
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));

    document.head.appendChild(link);
  });
}

/**
 * Load a library from jsDelivr CDN
 * @param {string} libraryName - Name of the library (key from jsDelivrLibraries)
 * @param {Object} options - Loading options
 * @param {boolean} options.loadCSS - Whether to load CSS if available (default: true)
 * @param {boolean} options.forceReload - Force reload even if already loaded (default: false)
 * @returns {Promise<void>}
 */
export async function loadLibrary(libraryName, options = {}) {
  const { loadCSS: shouldLoadCSS = true, forceReload = false } = options;

  // Check if library exists in configuration
  const library = jsDelivrLibraries[libraryName];
  if (!library) {
    throw new Error(`Library "${libraryName}" not found in jsDelivrLibraries configuration`);
  }

  // Check if already loaded
  if (!forceReload && loadedLibraries.has(libraryName)) {
    return;
  }

  try {
    // Load dependencies first
    if (library.dependsOn && Array.isArray(library.dependsOn)) {
      for (const dep of library.dependsOn) {
        await loadLibrary(dep, { loadCSS: shouldLoadCSS, forceReload });
      }
    }

    // Load CSS if available
    if (shouldLoadCSS && library.css) {
      await loadCSS(library.css, `jsdelivr-${libraryName}-css`);
    }

    // Load JavaScript
    if (library.js) {
      await loadScript(library.js, { id: `jsdelivr-${libraryName}-js` });
    }

    // Mark as loaded
    loadedLibraries.add(libraryName);

    logger.log(`✅ ${libraryName}@${library.version} loaded from jsDelivr`);
  } catch (error) {
    handleError(error, `jsDelivr Loader (${libraryName})`);
    throw error;
  }
}

/**
 * Load multiple libraries in parallel
 * @param {string[]} libraryNames - Array of library names to load
 * @param {Object} options - Loading options
 * @returns {Promise<void[]>}
 */
export async function loadLibraries(libraryNames, options = {}) {
  const promises = libraryNames.map((name) => loadLibrary(name, options));
  return Promise.all(promises);
}

/**
 * Check if a library is already loaded
 * @param {string} libraryName - Name of the library
 * @returns {boolean}
 */
export function isLibraryLoaded(libraryName) {
  return loadedLibraries.has(libraryName);
}

/**
 * Get library information
 * @param {string} libraryName - Name of the library
 * @returns {Object|null} Library configuration or null if not found
 */
export function getLibraryInfo(libraryName) {
  return jsDelivrLibraries[libraryName] || null;
}

/**
 * Get all available library names
 * @returns {string[]}
 */
export function getAvailableLibraries() {
  return Object.keys(jsDelivrLibraries);
}

/**
 * Generate jsDelivr URL for a package
 * @param {string} packageName - npm package name
 * @param {string} version - Package version
 * @param {string} file - File path within package (e.g., 'dist/index.min.js')
 * @param {Object} options - URL generation options
 * @param {boolean} options.minify - Use minified version (default: true)
 * @returns {string} jsDelivr CDN URL
 */
export function generateJsDelivrUrl(packageName, version, file, options = {}) {
  const { minify = true } = options;

  // Remove .min from file if minify is false
  let filePath = file;
  if (!minify && filePath.includes('.min.')) {
    filePath = filePath.replace('.min.', '.');
  }

  return `https://cdn.jsdelivr.net/npm/${packageName}@${version}/${filePath}`;
}

/**
 * Add a custom library to the configuration
 * @param {string} name - Library name
 * @param {Object} config - Library configuration
 * @param {string} config.version - Library version
 * @param {string} config.js - JavaScript file URL
 * @param {string|null} config.css - CSS file URL (optional)
 * @param {string[]} config.dependsOn - Dependencies (optional)
 */
export function addLibrary(name, config) {
  if (!config.version || !config.js) {
    throw new Error('Library config must include version and js URL');
  }

  jsDelivrLibraries[name] = {
    version: config.version,
    js: config.js,
    css: config.css || null,
    dependsOn: config.dependsOn || [],
  };
}
