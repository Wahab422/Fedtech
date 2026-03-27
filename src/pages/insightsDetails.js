import { appendElement, handleError, loadScript } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel } from 'src/components/carousel';
import { initAccordionCSS } from 'src/components/accordion';
import { initArticleAnchors } from '../components/articleAnchors';
import { initQuickJumps } from '../functions/quickJumps';
import { scheduleScrollRefresh } from '../global/lenis';
const cleanupFunctions = [];

export function initInsightsDetailsPage() {
  logger.log('💡 Insights details page initialized');

  try {
    loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes-richtext@1/richtext.js').then(
      () => {
        cleanupFunctions.push(initArticleAnchors());
        appendElement('[testimonials]', '#testimonials-slider');
        scheduleScrollRefresh();
        // Handle quick jumps for mobile
        if (window.innerWidth < 991) {
          if (!document.querySelector('#quick-jump-wrap')) return;
          cleanupFunctions.push(initQuickJumps());
          appendElement('#quick-jumps-body-wrap', '[anchors-list]');
        }
      }
    );
    cleanupFunctions.push(initCarousel());
    cleanupFunctions.push(initAccordionCSS());
  } catch (error) {
    handleError(error, 'Insights Details Page Initialization');
  }
}

export function cleanupInsightsDetailsPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Insights Details Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
