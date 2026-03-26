import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel, destroyCarousels } from '../components/carousel';

const cleanupFunctions = [];

export async function initInsightsPage() {
  logger.log('💡 Insights page initialized');

  try {
    initCarousel();
  } catch (error) {
    handleError(error, 'Insights Page Initialization');
  }
}

export function cleanupInsightsPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();

    } catch (error) {
      handleError(error, 'Insights Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
