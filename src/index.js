import { initGlobal } from './global';
import { logger } from './utils/logger';

document.documentElement.classList.add('has-js');

const pageRegistry = {
  home: () => import('./pages/home').then((m) => m.initHomePage),
};

let cachedPageName = null;
function getCurrentPage() {
  if (cachedPageName !== null) return cachedPageName;
  const bodyPage = document.body.getAttribute('data-page');
  const htmlPage = document.documentElement.getAttribute('data-page');
  cachedPageName = bodyPage || htmlPage || null;
  return cachedPageName;
}

async function initPage() {
  document.documentElement.classList.add('ready');

  try {
    await initGlobal();
  } catch (error) {
    logger.error('[Webflow Router] Error initializing global components:', error);
  }

  const pageName = getCurrentPage();

  if (!pageName) {
    logger.warn('[Webflow Router] No data-page attribute found on <html> or <body> tag');
    logger.log('[Webflow Router] Global components loaded, but no page-specific code will run');
    return;
  }

  const pageInit = pageRegistry[pageName];

  if (pageInit && typeof pageInit === 'function') {
    try {
      // Dynamically import and initialize the page module
      const initFn = await pageInit();
      if (initFn && typeof initFn === 'function') {
        initFn();
      }
    } catch (error) {
      logger.error(`[Webflow Router] Error initializing page "${pageName}":`, error);
    }
  } else {
    logger.warn(`[Webflow Router] No initialization function found for page: ${pageName}`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
