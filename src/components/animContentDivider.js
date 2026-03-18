import { observeInView } from '../utils/helpers';

export function animateContentDivider() {
    const contentDividers = document.querySelectorAll('.content-divider');
    if (!contentDividers.length) return;
    contentDividers.forEach((contentDivider) => {
        observeInView(
            contentDivider,
            (element) => {
                element.classList.add('animate');
            },
            { once: true }
        );
    });
}