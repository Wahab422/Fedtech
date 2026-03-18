/**
 * Basic Modal Component (Setup Guide)
 * Use when you need lightweight, accessible modals driven by data attributes.
 *
 * Quick start:
 * - Import: import { initModalBasic, cleanupModalBasic, closeModalBasic } from '../components/modal-basic';
 * - Init: call initModalBasic() once after DOM ready; call cleanupModalBasic() on page teardown/navigation.
 * - Markup checklist: [data-modal-name], [data-modal-target], [data-modal-close], optional [data-modal-content] wrapper for overlay close.
 * - Optional toggles: [data-modal-close-outside] (omit/true enables, "false" disables), [data-modal-escape="false"] to block ESC, [data-modal-label] for aria-label when no [data-modal-heading].
 * - Events: listen for modal:open / modal:close on the modal element; use closeModalBasic('api') to close programmatically.
 */

/**
 * Basic Modal Component
 * Enhances simple data-attribute driven modals with accessibility + focus management.
 *
 * HTML Structure (example):
 * <div data-modal-group-status="not-active">
 *   <button type="button" data-modal-target="contact-modal">
 *     Launch Contact Modal
 *   </button>
 *
 *   <div data-modal-name="contact-modal" data-modal-close-outside data-modal-label="Contact form">
 *     <div data-modal-content>
 *       <h2 data-modal-heading>Contact Us</h2>
 *       <p>Drop us a quick note and we will reply within 24 hours.</p>
 *
 *       <form>
 *         <!-- Your form fields -->
 *       </form>
 *
 *       <button type="button" data-modal-close>
 *         Close modal
 *       </button>
 *     </div>
 *   </div>
 * </div>
 *
 * Usage:
 * 1. Wrap modal content with an element that has [data-modal-name="uniqueName"].
 *    Optional attributes:
 *      - data-modal-close-outside (set or leave blank to enable outside click close, "false" to disable)
 *      - data-modal-escape="false" to disable closing with Escape
 *      - data-modal-label="Friendly label" if no [data-modal-heading] is provided
 * 2. Add the inner content wrapper with [data-modal-content] if you enable outside click close.
 * 3. Add trigger buttons/links with [data-modal-target="uniqueName"].
 * 4. Add any close buttons inside the modal with [data-modal-close].
 *
 * Bonus:
 * - Listen for `modal:open` / `modal:close` custom events on the modal element.
 * - Call `cleanupModalBasic()` before navigating away or re-initializing.
 *
 *
 * CSS:
 * 

 */

import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';

const SELECTORS = {
  modal: '[data-modal-name]',
  trigger: '[data-modal-target]',
  close: '[data-modal-close]',
  group: '[data-modal-group-status]',
  content: '[data-modal-content]',
};

const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'not-active';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

let listenersAttached = false;
let activeModal = null;
let previouslyFocusedElement = null;
let headingIdCounter = 0;
let modalIdCounter = 0;
const cleanupCallbacks = [];

/**
 * Initialize modal interactions (idempotent)
 */
export function initModalBasic() {
  if (typeof document === 'undefined') {
    logger.warn('[ModalBasic] document is undefined (SSR) - skipping init.');
    return;
  }

  try {
    const modals = document.querySelectorAll(SELECTORS.modal);

    if (!modals.length) {
      if (!listenersAttached) {
        logger.info('[ModalBasic] No modals found on the page - nothing to initialize.');
      }
      return;
    }

    // Always keep accessibility attributes in sync (supports calling init multiple times)
    modals.forEach(enhanceModalAccessibility);
    enhanceTargetAccessibility();

    if (listenersAttached) {
      return;
    }

    const clickHandler = (event) => {
      const trigger = event.target.closest(SELECTORS.trigger);

      if (trigger) {
        const modalName = trigger.getAttribute('data-modal-target');
        if (!modalName) {
          return;
        }

        event.preventDefault();

        const currentActiveName = activeModal?.getAttribute('data-modal-name');
        if (currentActiveName === modalName) {
          closeAllModals('toggle');
          return;
        }

        try {
          openModal(modalName, trigger);
        } catch (error) {
          handleError(error, 'Modal Basic Open');
        }
        return;
      }

      const closeBtn = event.target.closest(SELECTORS.close);
      if (closeBtn) {
        event.preventDefault();
        closeAllModals('button');
        return;
      }

      const modalRoot = activeModal && document.body.contains(activeModal) ? activeModal : null;
      if (
        modalRoot &&
        allowOutsideClose(modalRoot) &&
        shouldCloseOnOutsideClick(event, modalRoot)
      ) {
        closeAllModals('overlay');
      }
    };

    const keydownHandler = (event) => {
      if (!activeModal || (activeModal && !document.body.contains(activeModal))) {
        activeModal = null;
      }

      if (event.key === 'Escape') {
        if (activeModal && allowEscapeClose(activeModal)) {
          event.preventDefault();
          closeAllModals('escape');
        }
        return;
      }

      if (event.key === 'Tab' && activeModal) {
        trapFocus(event);
      }
    };

    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keydownHandler);

    cleanupCallbacks.push(() => document.removeEventListener('click', clickHandler));
    cleanupCallbacks.push(() => document.removeEventListener('keydown', keydownHandler));

    listenersAttached = true;
    logger.log(`🪟 ModalBasic ready (${modals.length} modal${modals.length > 1 ? 's' : ''})`);
  } catch (error) {
    handleError(error, 'Modal Basic Initialization');
  }
}

/**
 * Cleanup modal listeners & close any open modal
 */
export function cleanupModalBasic() {
  if (!listenersAttached && !activeModal) return;

  try {
    closeAllModals('cleanup', { skipFocusRestore: true });
    const callbacks = cleanupCallbacks.splice(0);
    callbacks.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, 'Modal Basic Cleanup');
      }
    });
  } finally {
    listenersAttached = false;
  }
}

/**
 * Programmatic helper to close the current modal
 */
export function closeModalBasic(reason = 'api') {
  closeAllModals(reason);
}

function openModal(modalName, trigger) {
  const modalSelector = getSafeSelector('data-modal-name', modalName);
  if (!modalSelector) {
    logger.warn('[ModalBasic] Invalid modal name provided.');
    return;
  }

  const modal = document.querySelector(modalSelector);
  if (!modal) {
    logger.warn(`[ModalBasic] Modal "${modalName}" not found in the DOM.`);
    return;
  }

  if (activeModal === modal) {
    return;
  }

  closeAllModals('switch', { skipFocusRestore: true });

  previouslyFocusedElement =
    (trigger && typeof trigger.focus === 'function' && trigger) ||
    (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  modal.setAttribute('data-modal-status', STATUS_ACTIVE);
  modal.setAttribute('aria-hidden', 'false');

  updateTriggerState(modalName, STATUS_ACTIVE);

  const group = findModalGroup(modal, trigger);
  if (group) {
    group.setAttribute('data-modal-group-status', STATUS_ACTIVE);
  }

  activeModal = modal;

  modal.dispatchEvent(
    new CustomEvent('modal:open', {
      detail: {
        name: modalName,
        trigger,
      },
      bubbles: true,
    })
  );

  focusModal(modal);
}

function closeAllModals(reason = 'manual', options = {}) {
  if (typeof document === 'undefined') return;

  const { skipFocusRestore = false } = options;

  resetAllTriggers();

  document.querySelectorAll(SELECTORS.modal).forEach((modal) => {
    const wasActive = modal.getAttribute('data-modal-status') === STATUS_ACTIVE;

    modal.setAttribute('data-modal-status', STATUS_INACTIVE);
    modal.setAttribute('aria-hidden', 'true');

    if (modal.getAttribute('data-modal-temp-tabindex') === 'true') {
      modal.removeAttribute('tabindex');
      modal.removeAttribute('data-modal-temp-tabindex');
    }

    if (wasActive) {
      modal.dispatchEvent(
        new CustomEvent('modal:close', {
          detail: {
            name: modal.getAttribute('data-modal-name'),
            reason,
          },
          bubbles: true,
        })
      );
    }
  });

  document.querySelectorAll(SELECTORS.group).forEach((group) => {
    group.setAttribute('data-modal-group-status', STATUS_INACTIVE);
  });

  if (
    !skipFocusRestore &&
    previouslyFocusedElement &&
    typeof previouslyFocusedElement.focus === 'function' &&
    document.contains(previouslyFocusedElement)
  ) {
    try {
      previouslyFocusedElement.focus({ preventScroll: true });
    } catch (error) {
      previouslyFocusedElement.focus();
    }
  }

  previouslyFocusedElement = null;
  activeModal = null;
}

function enhanceModalAccessibility(modal) {
  ensureModalId(modal);

  if (!modal.hasAttribute('role')) {
    modal.setAttribute('role', 'dialog');
  }
  modal.setAttribute('aria-modal', 'true');

  if (!modal.hasAttribute('data-modal-status')) {
    modal.setAttribute('data-modal-status', STATUS_INACTIVE);
  }

  const isActive = modal.getAttribute('data-modal-status') === STATUS_ACTIVE;
  modal.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  if (!modal.hasAttribute('aria-labelledby')) {
    const heading = modal.querySelector('[data-modal-heading]');
    if (heading) {
      if (!heading.id) {
        headingIdCounter += 1;
        heading.id = `modal-heading-${headingIdCounter}`;
      }
      modal.setAttribute('aria-labelledby', heading.id);
    }
  }

  if (!modal.hasAttribute('aria-label') && !modal.hasAttribute('aria-labelledby')) {
    modal.setAttribute('aria-label', modal.getAttribute('data-modal-label') || 'Modal dialog');
  }
}

function enhanceTargetAccessibility() {
  const triggers = document.querySelectorAll(SELECTORS.trigger);
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const modalName = trigger.getAttribute('data-modal-target');
    if (!modalName) return;

    const modalSelector = getSafeSelector('data-modal-name', modalName);
    if (!modalSelector) return;

    const modal = document.querySelector(modalSelector);
    if (!modal) {
      logger.warn(`[ModalBasic] Trigger found for unknown modal "${modalName}"`);
      return;
    }

    const modalId = ensureModalId(modal);
    trigger.setAttribute('aria-controls', modalId);
    trigger.setAttribute('aria-haspopup', 'dialog');

    if (!trigger.hasAttribute('data-modal-status')) {
      trigger.setAttribute('data-modal-status', STATUS_INACTIVE);
    }

    const isActive = modal.getAttribute('data-modal-status') === STATUS_ACTIVE;
    trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    trigger.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function focusModal(modal) {
  const focusable = getFocusableElements(modal);
  const target = focusable[0] || modal;

  requestAnimationFrame(() => {
    if (target === modal && !modal.hasAttribute('tabindex')) {
      modal.setAttribute('tabindex', '-1');
      modal.setAttribute('data-modal-temp-tabindex', 'true');
    }

    if (typeof target.focus === 'function') {
      try {
        target.focus({ preventScroll: true });
      } catch (error) {
        target.focus();
      }
    }
  });
}

function trapFocus(event) {
  if (!activeModal) return;

  const focusableElements = getFocusableElements(activeModal);
  if (!focusableElements.length) {
    event.preventDefault();
    focusModal(activeModal);
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const isShiftPressed = event.shiftKey;
  const activeElement = document.activeElement;

  if (isShiftPressed && activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!isShiftPressed && activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    const isHidden = element.getAttribute('aria-hidden') === 'true';
    const isDisabled = element.hasAttribute('disabled');
    return !isHidden && !isDisabled;
  });
}

function shouldCloseOnOutsideClick(event, modal) {
  if (!modal.contains(event.target)) return false;

  const content = modal.querySelector(SELECTORS.content);
  if (!content) {
    // If there's no content wrapper, treat clicks directly on the modal root as overlay clicks
    return event.target === modal;
  }

  return !content.contains(event.target);
}

function allowOutsideClose(modal) {
  if (!modal) return false;
  if (!modal.hasAttribute('data-modal-close-outside')) return false;
  return modal.getAttribute('data-modal-close-outside') !== 'false';
}

function allowEscapeClose(modal) {
  return modal.getAttribute('data-modal-escape') !== 'false';
}

function findModalGroup(modal, trigger) {
  return modal.closest(SELECTORS.group) || trigger?.closest(SELECTORS.group) || null;
}

function resetAllTriggers() {
  document.querySelectorAll(SELECTORS.trigger).forEach((trigger) => {
    trigger.setAttribute('data-modal-status', STATUS_INACTIVE);
    trigger.setAttribute('aria-pressed', 'false');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

function updateTriggerState(modalName, status) {
  const selector = getSafeSelector('data-modal-target', modalName);
  if (!selector) return;

  document.querySelectorAll(selector).forEach((trigger) => {
    trigger.setAttribute('data-modal-status', status);
    const isActive = status === STATUS_ACTIVE;
    trigger.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
}

function ensureModalId(modal) {
  if (modal.id) return modal.id;
  modalIdCounter += 1;
  const newId = `modal-${modalIdCounter}`;
  modal.id = newId;
  return newId;
}

function getSafeSelector(attribute, value) {
  if (!attribute || value === null || typeof value === 'undefined') {
    return '';
  }

  const valueAsString = String(value);
  const escaped =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(valueAsString)
      : valueAsString.replace(/"/g, '\\"');

  return `[${attribute}="${escaped}"]`;
}
