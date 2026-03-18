import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel, destroyCarousels } from '../components/carousel';
import { initTabs, cleanupTabs } from '../components/tabs';
const cleanupFunctions = [];

export async function initHomePage() {
  logger.log('🏠 Home page initialized');

  try {
    initCarousel();
    initTabs();
    cleanupFunctions.push(() => {
      try {
        cleanupCarousels();
      } catch (error) {
        handleError(error, 'Home Page Carousel Cleanup');
      }
    });

    cleanupFunctions.push(() => {
      try {
        destroyCarousels();
      } catch (error) {
        handleError(error, 'Home Page Carousel Cleanup');
      }
    });

    cleanupFunctions.push(() => {
      try {
        cleanupTabs();
      } catch (error) {
        handleError(error, 'Home Page Tabs Cleanup');
      }
    });
  } catch (error) {
    handleError(error, 'Home Page Initialization');
  }
}

export function cleanupHomePage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Home Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
