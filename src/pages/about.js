import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initAccordion } from '../components/accordion';

const cleanupFunctions = [];

export async function initAboutPage() {
  logger.log('ℹ️ About page initialized');

  try {
    initAccordion();
  } catch (error) {
    handleError(error, 'About Page Initialization');
  }
}

export function cleanupAboutPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'About Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
