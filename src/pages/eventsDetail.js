import { appendElement, handleError, loadScript } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel } from 'src/components/carousel';
import { initAccordionCSS } from 'src/components/accordion';
import { initArticleAnchors } from '../components/articleAnchors';
import { scheduleScrollRefresh } from '../global/lenis';
const cleanupFunctions = [];

export function initEventsDetailPage() {
  logger.log('📌 Events detail page initialized');

  try {
    calculateSpeakers();
    separateTextByComma();
    loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes-richtext@1/richtext.js').then(
      () => {
        cleanupFunctions.push(initArticleAnchors());
        appendElement('#multi-img-slider-wrap', '#multi-img-slider', { emptyParent: true });
        appendElement('[testimonials]', '#testimonials-slider');
        appendElement('[participants get]', '#participants get');
        scheduleScrollRefresh();
      }
    );
    cleanupFunctions.push(initCarousel());
    cleanupFunctions.push(initAccordionCSS());
  } catch (error) {
    handleError(error, 'Events Detail Page Initialization');
  }
}

export function cleanupEventsDetailPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Events Detail Page Cleanup');
    }
  });

  cleanupFunctions.length = 0;
}

function calculateSpeakers() {
  if (!document.querySelectorAll('[speakers-tag]').length) return;
  document.querySelectorAll('[speakers-tag]').forEach((wrapper) => {
    const speakers = wrapper.querySelectorAll('[speaker-item]');
    const totalEl = wrapper.querySelector('[total-speakers]');

    if (totalEl) {
      const count = speakers.length;
      totalEl.textContent = `${count} Speaker${count !== 1 ? 's' : ''}`;
    }
  });
}

function separateTextByComma() {
  const wrappers = document.querySelectorAll('[separate-text-comma]');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const items = wrapper.querySelectorAll('.w-dyn-item > div');
    const texts = Array.from(items)
      .map((el) => el.textContent.trim())
      .filter(Boolean);
    const combinedText = texts.join(', ');
    wrapper.innerHTML = `<div class="style-label">${combinedText}</div>`;
  });
}
