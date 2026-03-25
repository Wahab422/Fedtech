import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { initCarousel, destroyCarousels } from '../components/carousel';
import { initTabs, cleanupTabs } from '../components/tabs';
import { initEventsList } from '../functions/eventsList';
const cleanupFunctions = [];

export async function initHomePage() {
  logger.log('🏠 Home page initialized');

  try {
    updateNextEventDate();
    initCarousel();
    initTabs();
    initEventsList(cleanupFunctions);

    cleanupFunctions.push(() => {
      try {
        cleanupCarousels();
      } catch (error) {
        handleError(error, 'Home Page Carousel Cleanup');
      }
    });

    cleanupFunctions.push(() => {
      try {
        destroyCarousels();
      } catch (error) {
        handleError(error, 'Home Page Carousel Cleanup');
      }
    });

    cleanupFunctions.push(() => {
      try {
        cleanupTabs();
      } catch (error) {
        handleError(error, 'Home Page Tabs Cleanup');
      }
    });
  } catch (error) {
    handleError(error, 'Home Page Initialization');
  }
}

export function cleanupHomePage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Home Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}

function updateNextEventDate() {
  const homeHeroSliderComp = document.querySelector('#home-hero-slider-comp');
  if (!homeHeroSliderComp) return;

  const now = new Date();
  const slides = Array.from(homeHeroSliderComp.querySelectorAll('[role="listitem"]'));

  let nextEventDate = null;
  let nextEventHref = '';

  for (const slide of slides) {
    const dateEl = slide.querySelector('[data-event="event-date-time"]');
    if (!dateEl) continue;

    const eventDate = new Date(dateEl.textContent.trim());
    if (isNaN(eventDate)) continue;

    if (eventDate <= now) {
      slide.remove();
    } else {
      nextEventDate = eventDate;
      nextEventHref = slide.querySelector('a')?.href || '';
      break;
    }
  }

  const counter = homeHeroSliderComp.querySelector('#next-event-coming-in');
  if (counter && nextEventDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntil = Math.ceil((nextEventDate - now) / msPerDay);
    counter.textContent = daysUntil + ' day' + (daysUntil !== 1 ? 's' : '');
  } else if (counter) {
    counter.textContent = 'No upcoming events';
  }

  const nextEventLink = homeHeroSliderComp.querySelector('#next-event-coming-link');
  if (nextEventLink) {
    nextEventLink.href = nextEventHref;
  }
}