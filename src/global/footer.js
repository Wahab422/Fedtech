import { handleError, backToTop } from '../utils/helpers';
import { logger } from '../utils/logger';

const cleanupFunctions = [];

export function initFooter() {
  logger.log('🦶 Footer initialized');

  const backToTopButton = document.querySelector('#data-back-to-top');
  if (backToTopButton) {
    const handleClick = () => {
      backToTop();
    };

    backToTopButton.addEventListener('click', handleClick, { passive: true });

    cleanupFunctions.push(() => {
      window.removeEventListener('scroll', scrollHandler);
      backToTopButton.removeEventListener('click', handleClick);
    });
  }
}

export function cleanupFooter() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Footer Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
