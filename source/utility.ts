import { watchMotion, durationOf } from 'web-utility/source/animation';

export function watchStop(element: HTMLElement) {
    return watchMotion(
        durationOf('transition', element) ? 'transition' : 'animation',
        element
    );
}

export function scrollTo(selector: string, root?: Element) {
    const [_, ID] = /^#(.+)/.exec(selector) || [];

    if (ID === 'top') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    else
        (root || document)
            .querySelector(ID ? `[id="${ID}"]` : selector)
            ?.scrollIntoView({ behavior: 'smooth' });
}
