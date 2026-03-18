/**
 * Accordion Component (Shared Utility)
 * CSS-based accordion with optional image sync
 * Performance optimized: Loads only when accordion comes into view!
 *
 * This is NOT a global component - import it on pages where you need accordions
 *
 * Usage:
 * 1. Import: import { initAccordion } from '../components/accordion';
 * 2. Call in your page init: initAccordion();
 * 3. Add data attributes in Webflow (see below)
 *
 * Webflow Setup:
 * 1. Add data-accordion-list="css" to the accordion container
 * 2. Add data-accordion to each accordion item
 * 3. Add data-accordion-toggle to the clickable header/trigger
 * 4. Add data-accordion-content to the content panel
 *
 * Options (add to data-accordion-list element):
 * - data-accordion-close-siblings="true" - Close other panels when one opens
 * - data-accordion-first-active="true" - Open first panel on load
 * - data-accordion-collapsible="false" - Keep at least one panel open (defaults to true)
 * - data-accordion-event="hover" - Use hover instead of click
 */

import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';

const accordionInitialized = new Set();

/**
 * Actually initialize a specific accordion
 */
function actuallyInitAccordion(accordion) {
  // Skip if already initialized
  if (accordionInitialized.has(accordion)) return;
  accordionInitialized.add(accordion);

  logger.log('🎵 Accordion initializing...');

  try {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';
    const firstActive = accordion.getAttribute('data-accordion-first-active') === 'true';
    const collapsible = accordion.getAttribute('data-accordion-collapsible') !== 'false';
    const eventType = accordion.getAttribute('data-accordion-event') || 'click';

    // Add accessibility attributes to accordion container
    accordion.setAttribute('role', 'region');
    if (!accordion.hasAttribute('aria-label')) {
      accordion.setAttribute('aria-label', 'Accordion');
    }

    // Setup accessibility for each accordion item
    const items = accordion.querySelectorAll('[data-accordion]');
    items.forEach((item, index) => {
      const toggle = item.querySelector('[data-accordion-toggle]');
      const content = item.querySelector('[data-accordion-content]');

      if (toggle && content) {
        // Generate unique IDs if needed
        const contentId = content.id || `accordion-content-${Date.now()}-${index}`;
        const toggleId = toggle.id || `accordion-toggle-${Date.now()}-${index}`;

        content.id = contentId;
        toggle.id = toggleId;

        // Add ARIA attributes
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-controls', contentId);
        toggle.setAttribute('aria-expanded', item.getAttribute('data-accordion') === 'active');
        toggle.setAttribute('tabindex', '0');

        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', toggleId);
      }
    });

    // Initialize first panel open if requested
    if (firstActive) {
      const first = accordion.querySelector('[data-accordion]');
      if (first) {
        first.setAttribute('data-accordion', 'active');
        const toggle = first.querySelector('[data-accordion-toggle]');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'true');
        }
        // Dispatch event for initial state
        first.dispatchEvent(
          new CustomEvent('accordion:toggle', {
            detail: { open: true },
            bubbles: true,
          })
        );
      }
    }

    // Shared logic to open/close an item
    function toggleItem(item, open) {
      // Prevent closing the last panel when collapsible="false"
      if (!open && !collapsible) {
        const activeCount = accordion.querySelectorAll('[data-accordion="active"]').length;
        if (activeCount <= 1) return;
      }

      item.setAttribute('data-accordion', open ? 'active' : 'not-active');

      // Update ARIA attributes for accessibility
      const toggle = item.querySelector('[data-accordion-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      // Dispatch custom event for image sync
      item.dispatchEvent(
        new CustomEvent('accordion:toggle', {
          detail: { open },
          bubbles: true,
        })
      );

      // If configured, close all other panels when one opens
      if (closeSiblings && open) {
        accordion.querySelectorAll('[data-accordion="active"]').forEach((sib) => {
          if (sib !== item) {
            sib.setAttribute('data-accordion', 'not-active');
            const sibToggle = sib.querySelector('[data-accordion-toggle]');
            if (sibToggle) {
              sibToggle.setAttribute('aria-expanded', 'false');
            }
            // Dispatch event for closing siblings too
            sib.dispatchEvent(
              new CustomEvent('accordion:toggle', {
                detail: { open: false },
                bubbles: true,
              })
            );
          }
        });
      }
    }

    // Hover interaction mode
    if (eventType === 'hover') {
      accordion.querySelectorAll('[data-accordion-toggle]').forEach((toggle) => {
        const item = toggle.closest('[data-accordion]');
        if (!item) return;

        toggle.addEventListener('mouseenter', () => {
          toggleItem(item, true);
        });

        // Uncomment to close on mouse leave
        // toggle.addEventListener('mouseleave', () => {
        //   toggleItem(item, false);
        // });
      });
    }
    // Click interaction mode (default)
    else {
      accordion.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-accordion-toggle]');
        if (!toggle) return;

        const item = toggle.closest('[data-accordion]');
        if (!item) return;

        const isActive = item.getAttribute('data-accordion') === 'active';
        toggleItem(item, !isActive);
      });

      // Keyboard navigation for accessibility (Enter, Space)
      accordion.addEventListener('keydown', (e) => {
        const toggle = e.target.closest('[data-accordion-toggle]');
        if (!toggle) return;

        // Handle Enter and Space keys
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const item = toggle.closest('[data-accordion]');
          if (!item) return;

          const isActive = item.getAttribute('data-accordion') === 'active';
          toggleItem(item, !isActive);
        }
      });
    }
  } catch (error) {
    handleError(error, 'Accordion Initialization');
  }
}

/**
 * Initialize CSS-based accordions
 * Performance optimized: Loads only when accordion comes into view!
 */
export function initAccordionCSS() {
  const accordions = document.querySelectorAll('[data-accordion-list="css"]');

  if (!accordions.length) return;

  logger.log(`⏳ Found ${accordions.length} accordion(s) - will initialize when visible...`);

  // Create Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const accordion = entry.target;

          // Stop observing
          observer.unobserve(accordion);

          // Mark as observed
          accordion.setAttribute('data-accordion-observed', 'true');

          // Initialize this accordion
          actuallyInitAccordion(accordion);
        }
      });
    },
    {
      root: null,
      rootMargin: '100px', // Initialize 100px before accordion enters viewport
      threshold: 0,
    }
  );

  // Observe all accordions
  accordions.forEach((accordion) => {
    observer.observe(accordion);
  });
}

/**
 * Initialize accordion image sync
 * Syncs images with accordion states
 * Performance optimized: Loads only when image block comes into view!
 *
 * Usage in Webflow:
 * 1. Create a parent element with data-accordion-imgs
 * 2. Inside, have your accordion with data-accordion-list="css"
 * 3. Add data-accordion-img to each image you want to sync
 * 4. Images will show/hide based on which accordion panel is active
 */
export function initAccordionImages() {
  const imgsBlocks = document.querySelectorAll('[data-accordion-imgs]');

  if (!imgsBlocks.length) return;

  logger.log(`⏳ Found ${imgsBlocks.length} accordion image block(s) - will sync when visible...`);

  // Create Intersection Observer for image blocks
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgsBlock = entry.target;

          // Stop observing
          observer.unobserve(imgsBlock);

          // Initialize image sync for this block
          initImageBlockSync(imgsBlock);
        }
      });
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    }
  );

  // Observe all image blocks
  imgsBlocks.forEach((block) => {
    observer.observe(block);
  });
}

/**
 * Initialize image sync for a specific block
 */
function initImageBlockSync(imgsBlock) {
  logger.log('🖼️ Accordion images syncing...');

  const accordions = imgsBlock.querySelectorAll('[data-accordion-list="css"] [data-accordion]');
  const imgs = imgsBlock.querySelectorAll('[data-accordion-img]');

  if (!accordions.length || !imgs.length) return;
  const setActiveByIndex = (idx) => {
    imgs.forEach((img, i) =>
      img.setAttribute('data-accordion-img', i === idx ? 'active' : 'not-active')
    );
  };

  const updateFromDOM = () => {
    const idx = Array.from(accordions).findIndex(
      (acc) => acc.getAttribute('data-accordion') === 'active'
    );
    if (idx >= 0) setActiveByIndex(idx);
  };

  // Initial run
  updateFromDOM();

  // Watch accordion toggles
  accordions.forEach((acc, i) => {
    acc.addEventListener('accordion:toggle', (e) => {
      if (e.detail.open) setActiveByIndex(i);
    });
  });

  logger.log('✅ Accordion images synced');
}

/**
 * Initialize all accordion functionality
 * Convenience function that calls both CSS and image sync
 */
export function initAccordion() {
  initAccordionCSS();
  initAccordionImages();
}
