import { handleError, backToTop } from '../utils/helpers';
import { logger } from '../utils/logger';

const cleanupFunctions = [];

export function initFooter() {
  logger.log('🦶 Footer initialized');

  const backToTopButtons = document.querySelectorAll('[data-back-to-top]');
  if (backToTopButtons.length) {
    const handleClick = () => {
      backToTop();
    };

    backToTopButtons.forEach((button) => {
      button.addEventListener('click', handleClick, { passive: true });
      cleanupFunctions.push(() => {
        button.removeEventListener('click', handleClick);
      });
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
