import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel } from '../components/carousel';
const cleanupFunctions = [];

export async function initBlogPage() {
  logger.log('📝 Blog page initialized');

  try {
    initCarousel();
  } catch (error) {
    handleError(error, 'Blog Page Initialization');
  }
}

export function cleanupBlogPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Blog Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
