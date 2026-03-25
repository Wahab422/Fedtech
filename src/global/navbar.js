/**
 * Navbar Component
 * Runs on every page
 * Performance optimized with RAF and passive listeners
 */

import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';

// Store cleanup functions for global components
const cleanupFunctions = [];

export function initNavbar() {
  logger.log('📱 Navbar initialized');

  try {
    const eventCleanups = [];

    // Toggle elements
    const toggleElements = document.querySelectorAll('[toggle-class]');

    if (toggleElements.length) {
      // Get elements in same toggle group (OPT-IN)
      const getGroupElements = (el, className) => {
        const group = el.getAttribute('toggle-group');

        return group
          ? document.querySelectorAll(`[toggle-class="${className}"][toggle-group="${group}"]`)
          : document.querySelectorAll(`[toggle-class="${className}"]:not([toggle-group])`);
      };

      // Outside remove control (OPT-IN)
      const shouldRemoveOnOutside = (el) => {
        return el.getAttribute('remove-class-outside') === 'true';
      };

      /************************
       * CLICK HANDLING
       *************************/
      const handleDocumentClick = (e) => {
        const trigger = e.target.closest('[toggle-trigger]');
        const clicked = trigger
          ? trigger.closest('[toggle-class]')
          : e.target.closest('[toggle-class]');

        if (clicked) {
          const className = clicked.getAttribute('toggle-class');
          const isHoverToggle = clicked.getAttribute('toggle-on') === 'hover';
          const groupEls = getGroupElements(clicked, className);
          const hasClass = clicked.classList.contains(className);

          // Mobile hover → tap behavior
          if (isHoverToggle && window.innerWidth <= 768) {
            groupEls.forEach((el) => el.classList.remove(className));
            if (!hasClass) clicked.classList.add(className);
            return;
          }

          // Normal click toggle
          if (!isHoverToggle) {
            groupEls.forEach((el) => el.classList.remove(className));
            if (!hasClass) clicked.classList.add(className);
          }
        } else {
          // CLICK OUTSIDE (only opted-in elements)
          toggleElements.forEach((el) => {
            if (!shouldRemoveOnOutside(el)) return;

            const className = el.getAttribute('toggle-class');
            el.classList.remove(className);
          });
        }
      };
      document.addEventListener('click', handleDocumentClick);
      eventCleanups.push(() => document.removeEventListener('click', handleDocumentClick));

      /************************
       * HOVER HANDLING (DESKTOP)
       *************************/
      toggleElements.forEach((el) => {
        if (el.getAttribute('toggle-on') === 'hover' && window.innerWidth > 768) {
          const className = el.getAttribute('toggle-class');
          const triggers = el.querySelectorAll('[toggle-trigger]');
          const groupEls = getGroupElements(el, className);

          // OPEN on hover (any trigger)
          triggers.forEach((trigger) => {
            const handleMouseEnter = () => {
              groupEls.forEach((i) => i.classList.remove(className));
              el.classList.add(className);
            };
            trigger.addEventListener('mouseenter', handleMouseEnter);
            eventCleanups.push(() => trigger.removeEventListener('mouseenter', handleMouseEnter));
          });

          // CLOSE on leave ONLY if opted-in
          if (shouldRemoveOnOutside(el)) {
            const handleMouseLeave = () => {
              el.classList.remove(className);
            };
            el.addEventListener('mouseleave', handleMouseLeave);
            eventCleanups.push(() => el.removeEventListener('mouseleave', handleMouseLeave));
          }
        }
      });
    }

    const nav = document.querySelector('[nav]');
    const menuBtn = document.querySelector('[menu-button]');
    if (menuBtn && nav) {
      const handleMenuClick = () => {
        nav.classList.toggle('open');
      };
      menuBtn.addEventListener('click', handleMenuClick);
      eventCleanups.push(() => menuBtn.removeEventListener('click', handleMenuClick));
    }

    if (nav) {
      let prevScrollPos = window.pageYOffset;
      const scrollHandler = () => {
        const currentScrollPos = window.pageYOffset;

        if (currentScrollPos > 0) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        if (window.innerWidth > 768) {
          if (prevScrollPos > currentScrollPos) {
            nav.classList.remove('scroll-down');
          } else {
            nav.classList.add('scroll-down');
          }
        }

        prevScrollPos = currentScrollPos;
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });
      scrollHandler();
      eventCleanups.push(() => window.removeEventListener('scroll', scrollHandler));
    }

    cleanupFunctions.push(() => {
      eventCleanups.forEach((cleanup) => cleanup());
    });
  } catch (error) {
    handleError(error, 'Navbar Initialization');
  }
}

export function cleanupNavbar() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Navbar Cleanup');
    }
  });
  cleanupFunctions.length = 0;
}
