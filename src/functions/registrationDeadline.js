export function initRegistrationDeadline() {
  const deadlineEl = document.querySelector('#registration-deadline');
  if (!deadlineEl) return;

  const textEls = document.querySelectorAll('[registration-deadline-text]');
  if (!textEls.length) return;

  const deadlineDate = new Date(deadlineEl.textContent.trim());
  if (Number.isNaN(deadlineDate.getTime())) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

  textEls.forEach((text) => {
    if (diffDays > 0) {
      text.textContent = `Registration closes in ${String(diffDays)} days`;
    } else if (diffDays === 0) {
      text.textContent = 'Registration closes today';
    } else {
      text.textContent = 'Registration is closed';
    }
  });
}
