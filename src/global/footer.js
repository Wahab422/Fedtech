/**
 * Footer Component
 * Runs on every page
 * Performance optimized with cleanup and throttling
 */

import { rafThrottle, handleError, backToTop } from '../utils/helpers';
import { logger } from '../utils/logger';

// Store cleanup functions for footer
const cleanupFunctions = [];

export function initFooter() {
  logger.log('🦶 Footer initialized');

  // Dynamic copyright year
  const copyrightYear = document.querySelector('[data-copyright-year]');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // Back to top button
  const backToTopButton = document.querySelector('[data-back-to-top]');
  if (backToTopButton) {
    // Throttled scroll handler for performance
    const scrollHandler = rafThrottle(() => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('is-visible');
      } else {
        backToTopButton.classList.remove('is-visible');
      }
    });

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Smooth scroll to top
    const handleClick = () => {
      backToTop();
    };

    backToTopButton.addEventListener('click', handleClick, { passive: true });

    // Store cleanup
    cleanupFunctions.push(() => {
      window.removeEventListener('scroll', scrollHandler);
      backToTopButton.removeEventListener('click', handleClick);
    });
  }
}

/**
 * Cleanup function for footer
 * Called before re-initialization or page unload
 */
export function cleanupFooter() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Footer Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
