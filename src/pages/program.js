import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';
import { finsweetService } from '../global/finsweet';
import { initAccordionCSS } from '../components/accordion';

const cleanupFunctions = [];

export async function initProgramPage() {
  logger.log('📘 Program page initialized');

  try {
    initDurationRangeLabels();
    initNestedSectorsVisibility();
    cleanupFunctions.push(initAccordionCSS());
    await finsweetService.waitForAttribute('list');
    //await finsweetService.clearFilters('list');
  } catch (error) {
    handleError(error, 'Program Page Initialization');
  }
}

export function cleanupProgramPage() {
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      handleError(error, 'Program Page Cleanup');
    }
  });
  cleanupFunctions.length = 0;

  logger.log('🧹 Program page cleanup');
}

function initDurationRangeLabels() {
  const wrappers = document.querySelectorAll(
    '[fs-rangeslider-element="wrapper"].program-form__range'
  );
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const displayValueEl = wrapper.querySelector('[fs-rangeslider-element="display-value"]');
    if (!displayValueEl) return;

    const valueContainer =
      wrapper.querySelector('[data-filter-value]') || displayValueEl.parentElement;
    if (!valueContainer) return;

    const renderUnit = () => {
      const rawValue = Number.parseInt(displayValueEl.textContent || '', 10);
      const unit = rawValue === 1 ? 'month' : 'months';

      let unitEl = valueContainer.querySelector('[data-duration-unit]');
      if (!unitEl) {
        // Remove old plain text suffixes like " months" before adding a dedicated unit node.
        Array.from(valueContainer.childNodes).forEach((node) => {
          if (node.nodeType !== Node.TEXT_NODE) return;
          if (/month/i.test(node.textContent || '')) {
            valueContainer.removeChild(node);
          }
        });

        unitEl = document.createElement('span');
        unitEl.setAttribute('data-duration-unit', '');
        valueContainer.append(' ');
        valueContainer.appendChild(unitEl);
      }

      unitEl.textContent = unit;
    };

    const observer = new MutationObserver(renderUnit);
    observer.observe(displayValueEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    renderUnit();

    cleanupFunctions.push(() => observer.disconnect());
  });
}

function initNestedSectorsVisibility() {
  const targetSelector = '[fs-list-element="nest-target"][fs-list-nest="sectors"]';

  const updateTargetState = (target) => {
    if (!(target instanceof Element)) return;

    const hasVisibleItems = Array.from(target.querySelectorAll('.w-dyn-item')).some((item) => {
      const text = item.textContent || '';
      return text.trim().length > 0;
    });

    target.classList.toggle('is-nest-ready', hasVisibleItems);
  };

  const updateAllTargets = () => {
    document.querySelectorAll(targetSelector).forEach((target) => updateTargetState(target));
  };

  updateAllTargets();

  let rafId = 0;
  const observer = new MutationObserver(() => {
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      updateAllTargets();
      rafId = 0;
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  cleanupFunctions.push(() => {
    if (rafId) cancelAnimationFrame(rafId);
    observer.disconnect();
  });
}
