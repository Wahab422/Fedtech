import { handleError, mirrorClick } from '../utils/helpers';
import { logger } from '../utils/logger';

const cleanupFunctions = [];

export async function initContactPage() {
  logger.log('✉️ Contact page initialized');

  try {
    mirrorClick('#contact-form-btn', '#contact-form-btn-hidden');
  } catch (error) {
    handleError(error, 'Contact Page Initialization');
  }
}

export function cleanupContactPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Contact Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
