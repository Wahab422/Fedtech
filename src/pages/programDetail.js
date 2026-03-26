import { appendElement, handleError, loadScript } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel } from 'src/components/carousel';
import { initAccordionCSS } from 'src/components/accordion';
import { initArticleAnchors } from '../components/articleAnchors';
import { scheduleScrollRefresh } from '../global/lenis';
const cleanupFunctions = [];

export function initProgramDetailPage() {
  logger.log('📄 Program detail page initialized');

  try {
    loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes-richtext@1/richtext.js').then(
      () => {
        cleanupFunctions.push(initArticleAnchors());
        appendElement('#multi-img-slider-wrap', '#multi-img-slider', { emptyParent: true });
        appendElement('[testimonials]', '#testimonials-slider');
        appendElement('[participants-get]', '#participants-get');
        scheduleScrollRefresh();
        // Handle quick jumps for mobile
        if (window.innerWidth < 991) {
          if (!document.querySelector('#quick-jump-wrap')) return;
          handleQuickJumps();
          appendElement('#quick-jumps-body-wrap', '[anchors-list]');
          function handleQuickJumps() {
            const accordion = document.querySelector('#quick-jump-accordion');
            const toggleBtn = accordion.querySelector('[data-accordion-toggle]');

            toggleBtn.addEventListener('click', (e) => {
              e.stopPropagation();

              const isActive = accordion.getAttribute('data-accordion') === 'active';

              accordion.setAttribute('data-accordion', isActive ? 'not-active' : 'active');
            });

            document.addEventListener('click', (e) => {
              if (!toggleBtn.contains(e.target)) {
                accordion.setAttribute('data-accordion', 'not-active');
              }
            });
          }
        }
      }
    );
    cleanupFunctions.push(initCarousel());
    cleanupFunctions.push(initAccordionCSS());
    separateTextByComma();
    initRegistrationCountdown();
  } catch (error) {
    handleError(error, 'Program Detail Page Initialization');
  }
}

export function cleanupProgramDetailPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Program Detail Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}

function initRegistrationCountdown() {
  const selector = '.info-warning__wrap[data-end-date]';
  const wrappers = document.querySelectorAll(selector);

  wrappers.forEach((wrapper) => {
    updateCountdownBanner(wrapper);
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (node.matches(selector)) {
          updateCountdownBanner(node);
        }

        node.querySelectorAll(selector).forEach((wrapper) => {
          updateCountdownBanner(wrapper);
        });
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  cleanupFunctions.push(() => observer.disconnect());
}

function updateCountdownBanner(wrapper) {
  if (!(wrapper instanceof Element)) return;

  const endDateRaw = wrapper.getAttribute('data-end-date');
  const date = parseDateOnly(endDateRaw);
  const target = wrapper.querySelector('.style-label') || wrapper;

  if (!date) {
    logger.warn(`[Program Detail] Invalid data-end-date value: ${endDateRaw}`);
    wrapper.classList.add('is-countdown-ready');
    return;
  }

  const sourceText = target.textContent || '';
  const daysLeft = getDaysUntil(date);

  if (sourceText.includes('{{1}}')) {
    target.textContent = sourceText.replace(/\{\{\s*1\s*\}\}/g, String(daysLeft));
  }

  wrapper.classList.add('is-countdown-ready');
}

function parseDateOnly(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getDaysUntil(endDate) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = endDate.getTime() - startOfToday.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.max(0, Math.ceil(diffMs / dayMs));
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
