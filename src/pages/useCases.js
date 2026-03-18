import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initAccordion } from '../components/accordion';
import { initCarousel } from '../components/carousel';

const cleanupFunctions = [];

export async function initUseCasesPage() {
  logger.log('📋 Use cases page initialized');

  try {
    initAccordion();
    initCarousel();
  } catch (error) {
    handleError(error, 'Use Cases Page Initialization');
  }
}

export function cleanupUseCasesPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Use Cases Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
