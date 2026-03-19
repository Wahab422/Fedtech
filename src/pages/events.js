import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initEventsList, countEventsStatus } from '../functions/eventsList';
import { smoothScrollTo } from '../utils/helpers';
const cleanupFunctions = [];

export async function initEventsPage() {
  logger.log('📅 Events page initialized');

  try {
    initEventsList(cleanupFunctions);
    countEventsStatus(cleanupFunctions);
    smoothScrollTo('#scroll-to-events-btn', '#events-filter', 80);
  } catch (error) {
    handleError(error, 'Events Page Initialization');
  }
}

export function cleanupEventsPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Events Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
