import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initTab } from '../components/tabs/tabsComp2';
import { initTabs } from '../components/tabs/tabsComp1';
import { initAccordion } from '../components/accordion';

const cleanupFunctions = [];

export async function initProductPage() {
  logger.log('📦 Product page initialized');

  try {
    initTab();
    initTabs();
    initAccordion();
  } catch (error) {
    handleError(error, 'Product Page Initialization');
  }
}

export function cleanupProductPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Product Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
