import { watchMotion, durationOf } from 'web-utility/source/animation';
import { parseURLData } from 'web-utility/source/URL';

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

export function parsePath(raw: string) {
    const [path, data] = raw.split('?');

    return data ? { ...parseURLData(data), path } : { path };
}
