import { initGlobal } from './global';
import { logger } from './utils/logger';

const pageRegistry = {
  home: () => import('./pages/home').then((m) => m.initHomePage),
  pricing: () => import('./pages/pricing').then((m) => m.initPricingPage),
  blog: () => import('./pages/blog').then((m) => m.initBlogPage),
  blogtemplate: () => import('./pages/blogtemplate').then((m) => m.initBlogTemplatePage),
  product: () => import('./pages/product').then((m) => m.initProductPage),
  howitworks: () => import('./pages/howItWorks').then((m) => m.initHowItWorksPage),
  support: () => import('./pages/support').then((m) => m.initSupportPage),
  about: () => import('./pages/about').then((m) => m.initAboutPage),
  useCases: () => import('./pages/useCases').then((m) => m.initUseCasesPage),
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
