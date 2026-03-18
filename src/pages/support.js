import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initAccordion } from '../components/accordion';
const cleanupFunctions = [];

export async function initSupportPage() {
  logger.log('🛟 Support page initialized');

  try {
    initAccordion();
  } catch (error) {
    handleError(error, 'Support Page Initialization');
  }
}

export function cleanupSupportPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Support Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
