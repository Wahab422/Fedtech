export function initQuickJumps({
  accordionSelector = '#quick-jump-accordion',
  wrapSelector = '#quick-jump-wrap',
} = {}) {
  const wrap = document.querySelector(wrapSelector);
  const accordion = document.querySelector(accordionSelector);

  if (!wrap || !accordion) {
    return () => { };
  }

  const toggleBtn = accordion.querySelector('[data-accordion-toggle]');
  if (!toggleBtn) {
    return () => { };
  }

  const handleToggleClick = (e) => {
    e.stopPropagation();
    const isActive = accordion.getAttribute('data-accordion') === 'active';
    accordion.setAttribute('data-accordion', isActive ? 'not-active' : 'active');
  };

  const handleDocumentClick = (e) => {
    if (!toggleBtn.contains(e.target)) {
      accordion.setAttribute('data-accordion', 'not-active');
    }
  };

  toggleBtn.addEventListener('click', handleToggleClick);
  document.addEventListener('click', handleDocumentClick);

  return () => {
    toggleBtn.removeEventListener('click', handleToggleClick);
    document.removeEventListener('click', handleDocumentClick);
  };
}
