import { watchMotion, durationOf } from 'web-utility/source/animation';
import { parseURLData } from 'web-utility/source/URL';

export function watchStop(element: HTMLElement) {
    return watchMotion(
        durationOf('transition', element) ? 'transition' : 'animation',
        element
    );
}

export function parsePath(raw: string) {
    const [path, data] = raw.split('?');

    return data ? { ...parseURLData(data), path } : { path };
}
