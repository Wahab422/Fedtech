import { appendElement, handleError, loadScript } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel } from 'src/components/carousel';
import { initAccordionCSS } from 'src/components/accordion';
import { initArticleAnchors } from '../components/articleAnchors';
import { initQuickJumps } from '../functions/quickJumps';
import { initRegistrationDeadline } from '../functions/registrationDeadline';
import { scheduleScrollRefresh } from '../global/lenis';
const cleanupFunctions = [];

export function initEventsDetailPage() {
  logger.log('📌 Events detail page initialized');

  try {
    calculateSpeakers();
    separateTextByComma();
    initRegistrationDeadline();
    loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes-richtext@1/richtext.js').then(
      () => {
        cleanupFunctions.push(initArticleAnchors());
        appendElement('[testimonials]', '#testimonials-slider');
        appendElement('[participants-get]', '#participants-get');
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
      if (wrapper.getAttribute('speakers-tag') === 'just-numbers') {
        totalEl.textContent = `${count}`;
      } else {
        totalEl.textContent = `${count} Speaker${count !== 1 ? 's' : ''}`;
      }
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
