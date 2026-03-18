import { logger } from '../utils/logger';
import { initArticleAnchors } from '../components/articleAnchors';
import { initCarousel } from '../components/carousel';
import { handleError, appendElement, loadScript } from '../utils/helpers';

const cleanupFunctions = [];

export async function initBlogTemplatePage() {
  logger.log('📄 Blog template page initialized');

  try {
    loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes-richtext@1/richtext.js').then(
      () => {
        setTimeout(() => {
          initArticleAnchors();
          appendElement('#multi-img-slider-wrap', '#multi-img-slider', { emptyParent: true });
          appendElement('[slider]', '#slider');
          appendElement('[testimonial]', '#testimonial-block');
          appendElement('[related-articles]', '#related-articles-block');
        }, 1000);
      }
    );
    initCarousel();
  } catch (error) {
    handleError(error, 'Blog Template Page Initialization');
  }
}

export function cleanupBlogTemplatePage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Blog Template Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
