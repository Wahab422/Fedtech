import { lenisSmoothScrollTo, rafThrottle } from '../utils/helpers';
import { logger } from '../utils/logger';

const DEFAULT_SELECTORS = {
  articleBody: '#article-body',
  anchor: '[anchor]',
  tocElement: '[toc-element]',
  anchorsWrapper: '[anchors-wrapper]',
  anchorsList: '[anchors-list]',
  anchorTemplate: '[anchor-element]',
  anchorText: '[anchor-text]',
  anchorNumber: '[anchor-number]',
  anchorProgressLine: '[anchor-progress-line]',
};

const navbar = document.querySelector('.nav');
const offset = navbar ? navbar.offsetHeight + 10 : 0;

const DEFAULT_OPTIONS = {
  offset: offset,
  scrollDuration: 1,
  preventDefault: true,
  setHref: false,
  activeRange: offset,
  activeClass: 'active',
  setAriaCurrent: true,
  ariaCurrentValue: 'page',
  anchorAttribute: 'target-element',
  dataAnchor: 'data-article-anchor',
  dataAnchorTemplate: 'data-article-anchor-template',
};

const ANCHOR_PLACEHOLDER_REGEX = /^<anchor=([^>]+)>$/;

function slugifyAnchorId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getUniqueAnchorId(baseId, usedIds, currentElement) {
  let uniqueId = baseId || 'anchor';
  let suffix = 1;
  while (usedIds.has(uniqueId)) {
    uniqueId = `${baseId || 'anchor'}-${suffix}`;
    suffix += 1;
  }
  let existingElement = document.getElementById(uniqueId);
  while (existingElement && existingElement !== currentElement) {
    uniqueId = `${baseId || 'anchor'}-${suffix}`;
    suffix += 1;
    existingElement = document.getElementById(uniqueId);
  }
  usedIds.add(uniqueId);
  return uniqueId;
}

/**
 * Replace literal text like "<anchor=introduction>" in the article body with a real <div anchor>.
 * Finds elements whose textContent is exactly "<anchor=...>", replaces them with a hidden anchor div.
 */
function replaceAnchorPlaceholders(articleBody) {
  if (!articleBody) return;
  const walker = document.createTreeWalker(articleBody, NodeFilter.SHOW_TEXT, null, false);
  const toReplace = [];
  let textNode;
  while ((textNode = walker.nextNode())) {
    const text = textNode.textContent.trim();
    const match = text.match(ANCHOR_PLACEHOLDER_REGEX);
    if (!match) continue;
    const parent = textNode.parentElement;
    if (!parent || parent.textContent.trim() !== text) continue;
    toReplace.push({ element: parent, label: match[1].trim() });
  }
  for (const { element, label } of toReplace) {
    const id = slugifyAnchorId(label) || 'anchor';
    const div = document.createElement('div');
    div.setAttribute('anchor', '');
    div.setAttribute('id', id);
    div.textContent = label;
    div.style.visibility = 'hidden';
    div.style.height = '0';
    div.style.overflow = 'hidden';
    div.style.margin = '0';
    div.style.padding = '0';
    element.parentNode?.replaceChild(div, element);
  }
}

export function initArticleAnchors(options = {}) {
  if (typeof document === 'undefined') return () => { };

  const selectors = {
    ...DEFAULT_SELECTORS,
    ...(options.selectors || {}),
  };

  const config = {
    ...DEFAULT_OPTIONS,
    ...(options.options || {}),
  };

  const anchorsWrapper = document.querySelector(selectors.anchorsWrapper);
  const articleBody = document.querySelector(selectors.articleBody);

  replaceAnchorPlaceholders(articleBody);

  const sectionTargets = articleBody
    ? Array.from(articleBody.querySelectorAll(`${selectors.anchor}, ${selectors.tocElement}`))
    : [];

  if (!anchorsWrapper) {
    logger.warn('[initArticleAnchors] Anchor list wrapper not found:', selectors.anchorsWrapper);
    return () => { };
  }

  if (!sectionTargets.length) {
    anchorsWrapper.classList.add('hide');
    anchorsWrapper.setAttribute('aria-hidden', 'true');
    return () => {
      anchorsWrapper.classList.remove('hide');
      anchorsWrapper.setAttribute('aria-hidden', 'false');
    };
  }

  const anchorTemplate = anchorsWrapper.querySelector(selectors.anchorTemplate);
  const anchorsList = anchorsWrapper.querySelector(selectors.anchorsList);

  if (anchorTemplate) {
    anchorTemplate.setAttribute(config.dataAnchorTemplate, '');
  }

  if (anchorsList) {
    anchorsList.replaceChildren();
  }

  const templateHasAnchorNumber = anchorTemplate?.querySelector(selectors.anchorNumber) != null;
  const templateHasProgressLine =
    anchorTemplate?.querySelector(selectors.anchorProgressLine) != null;

  const generatedAnchors = [];
  const cleanupHandlers = [];
  const anchorIdToItem = new Map();
  const usedAnchorIds = new Set();
  let scrollEndTimeoutId = null;

  sectionTargets.forEach((target, index) => {
    const isTocElement = target.matches(selectors.tocElement);
    const tocLabel = target.getAttribute('toc-element')?.trim() || '';
    const sectionLabel = isTocElement ? tocLabel : target.innerHTML;
    const sectionTextLabel = isTocElement ? tocLabel : target.textContent?.trim() || '';

    const baseId =
      target.id ||
      slugifyAnchorId(sectionTextLabel) ||
      (isTocElement ? `toc-element-${index + 1}` : `anchor_${index}`);
    const anchorID = getUniqueAnchorId(baseId, usedAnchorIds, target);
    if (!target.id) target.setAttribute('id', anchorID);

    let newAnchorText;
    if (anchorTemplate) {
      newAnchorText = index === 0 ? anchorTemplate : anchorTemplate.cloneNode(true);
    } else {
      logger.warn('[initArticleAnchors] Template not found, using fallback.');
      newAnchorText = document.createElement('div');
      newAnchorText.classList.add('inherit-styles');
    }

    const contentTarget = newAnchorText.querySelector(selectors.anchorText) || newAnchorText;
    contentTarget.innerHTML = sectionLabel;

    if (templateHasAnchorNumber) {
      const numberTarget = newAnchorText.querySelector(selectors.anchorNumber);
      if (numberTarget) numberTarget.textContent = index + 1;
    }
    if (templateHasProgressLine) {
      const progressLine = newAnchorText.querySelector(selectors.anchorProgressLine);
      if (progressLine) {
        progressLine.style.transformOrigin = 'left';
        progressLine.style.transition = 'transform 0.2s ease-out';
        progressLine.style.transform = 'scale3d(0, 1, 1)';
      }
    }

    newAnchorText.setAttribute(config.anchorAttribute, `#${anchorID}`);
    newAnchorText.setAttribute(config.dataAnchor, '');
    if (newAnchorText.tagName === 'A' && config.setHref) {
      newAnchorText.setAttribute('href', `#${anchorID}`);
    }
    if (anchorsList) anchorsList.appendChild(newAnchorText);

    generatedAnchors.push(newAnchorText);
    anchorIdToItem.set(anchorID, newAnchorText);

    const clickHandler = (e) => {
      if (config.preventDefault && e?.preventDefault) e.preventDefault();
      if (scrollEndTimeoutId) clearTimeout(scrollEndTimeoutId);
      setActive(anchorID);
      lenisSmoothScrollTo(`#${anchorID}`, config.offset - 1, { duration: config.scrollDuration });
      scrollEndTimeoutId = setTimeout(
        () => {
          scrollEndTimeoutId = null;
          highlightActiveAnchor();
        },
        (config.scrollDuration ?? 1) * 1000 + 80
      );
    };
    newAnchorText.addEventListener('click', clickHandler);
    cleanupHandlers.push(() => newAnchorText.removeEventListener('click', clickHandler));
  });

  const allSidebarItems = generatedAnchors;

  const setActive = (anchorID) => {
    for (const el of allSidebarItems) {
      el.classList.remove(config.activeClass);
      if (config.setAriaCurrent) el.removeAttribute('aria-current');
    }
    if (!anchorID) return;
    const match = anchorIdToItem.get(anchorID);
    if (match) {
      match.classList.add(config.activeClass);
      if (config.setAriaCurrent) match.setAttribute('aria-current', config.ariaCurrentValue);
    }
  };

  const getSectionEnd = (i, scrollY) => {
    if (i < sectionTargets.length - 1) {
      return sectionTargets[i + 1].getBoundingClientRect().top + scrollY;
    }
    return articleBody.getBoundingClientRect().top + scrollY + articleBody.offsetHeight;
  };

  const updateScrollState = () => {
    if (!articleBody) return;

    const scrollY = window.scrollY ?? window.pageYOffset;
    const contentTop = scrollY + config.offset;
    let activeId = null;

    for (let i = 0; i < sectionTargets.length; i++) {
      const target = sectionTargets[i];
      const anchorID = target.id;
      if (!anchorID) continue;

      const sectionStart = target.getBoundingClientRect().top + scrollY;
      const sectionEnd = getSectionEnd(i, scrollY);
      const sectionHeight = sectionEnd - sectionStart;

      let progress;
      if (contentTop <= sectionStart) progress = 0;
      else if (contentTop >= sectionEnd) progress = 1;
      else progress = sectionHeight > 0 ? (contentTop - sectionStart) / sectionHeight : 0;
      progress = Math.min(1, Math.max(0, progress));

      if (progress > 0) activeId = anchorID;

      const item = anchorIdToItem.get(anchorID);
      if (!item) continue;

      if (contentTop >= sectionEnd) item.classList.add('is-passed');
      else item.classList.remove('is-passed');

      if (templateHasProgressLine) {
        const line = item.querySelector(selectors.anchorProgressLine);
        if (line) line.style.transform = `scale3d(${progress}, 1, 1)`;
      }
    }

    setActive(activeId);
  };

  const highlightActiveAnchor = rafThrottle(updateScrollState);

  window.addEventListener('scroll', highlightActiveAnchor, { passive: true });
  cleanupHandlers.push(() => window.removeEventListener('scroll', highlightActiveAnchor));
  highlightActiveAnchor();

  return () => {
    if (scrollEndTimeoutId) clearTimeout(scrollEndTimeoutId);
    cleanupHandlers.forEach((cleanup) => cleanup());
    generatedAnchors.forEach((anchor) => anchor.remove());
  };
}
