export function initEventsList(cleanupFunctions = []) {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    () => {
      const listEl = document.querySelector('[events-list]');
      if (!listEl) return;

      const observer = new MutationObserver((mutations) => {
        const newItems = [];

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.matches('.w-dyn-item')) {
              newItems.push(node);
            }
          });
        });

        if (newItems.length) {
          updateEventItems(newItems);
        }
      });

      observer.observe(listEl, {
        childList: true,
      });
      cleanupFunctions.push(() => observer.disconnect());

      const initialItems = document.querySelectorAll('[event-item]');
      updateEventItems(initialItems);
    },
  ]);
}

export function countEventsStatus() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    () => {
      const items = document.querySelectorAll('[event-item]');
      let pastCount = 0;
      let upcomingCount = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      items.forEach((item) => {
        const dateEl = item.querySelector('[event-date]');
        if (!dateEl) return;

        const eventDate = new Date(dateEl.textContent.trim());
        if (isNaN(eventDate.getTime())) return;

        eventDate.setHours(0, 0, 0, 0);

        if (eventDate >= today) upcomingCount++;
        else pastCount++;
      });

      const pastEl = document.querySelector('[past-events-count]');
      const upcomingEl = document.querySelector('[upcoming-events-count]');
      if (pastEl) pastEl.textContent = pastCount;
      if (upcomingEl) upcomingEl.textContent = upcomingCount;
    },
  ]);
}

function updateEventItems(items) {
  const msPerDay = 1000 * 60 * 60 * 24;

  items.forEach((item) => {
    const speakers = item.querySelectorAll('[speaker-item]');
    const count = speakers.length;
    const speakersLabel = item.querySelector('[total-speakers]');

    if (speakersLabel) {
      speakersLabel.textContent = `${count} Speaker${count !== 1 ? 's' : ''}`;
    }

    const dateEl = item.querySelector('[event-date]');
    const pillTag = item.querySelector('.pill-tag');

    if (!dateEl || !pillTag) return;

    const rawDate = dateEl.textContent.trim();
    const eventDate = new Date(rawDate);

    if (isNaN(eventDate.getTime())) {
      pillTag.textContent = 'Invalid date';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    eventDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.round((eventDate - today) / msPerDay);

    if (diffInDays > 30) {
      const diffInMonths = Math.floor(diffInDays / 30);
      pillTag.textContent = diffInMonths === 1 ? 'month left' : `${diffInMonths} months left`;
      pillTag.setAttribute('pill-color', 'green');
    } else if (diffInDays > 0) {
      pillTag.textContent = `${diffInDays} day${diffInDays > 1 ? 's' : ''} left`;
      pillTag.setAttribute('pill-color', 'green');
    } else if (diffInDays === 0) {
      pillTag.textContent = 'Today';
      pillTag.setAttribute('pill-color', 'yellow');
    } else {
      pillTag.textContent = 'Past event';
    }
  });
}
