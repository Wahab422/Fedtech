import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initAccordion } from '../components/accordion';
import { initTab } from '../components/tabs/tabsComp2';
import { initTabs } from '../components/tabs/tabsComp1';
const cleanupFunctions = [];

export async function initHowItWorksPage() {
  logger.log('⚙️ How it works page initialized');

  try {
    initAccordion();
    initTabs();
    initTab();
  } catch (error) {
    handleError(error, 'How It Works Page Initialization');
  }
}

export function cleanupHowItWorksPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'How It Works Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
