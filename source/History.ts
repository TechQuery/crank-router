import { createQueue } from 'iterable-observer';

import { scrollTo } from './utility';

export enum PathPrefix {
    hash = '#',
    path = '/'
}

export type PathMode = keyof typeof PathPrefix;

const { location, history } = window;

export class History {
    stream = createQueue<string>();
    prefix: PathPrefix;

    get path() {
        return location[
            this.prefix === PathPrefix.hash ? 'hash' : 'pathname'
        ].slice(1);
    }

    constructor(mode: PathMode = 'hash') {
        this.prefix = PathPrefix[mode];
    }

    [Symbol.asyncIterator]() {
        return this.stream.observable[Symbol.asyncIterator]();
    }

    private pending = false;

    async set(path: string, title = document.title) {
        if (this.pending) return;

        document.title = title;

        this.pending = true;

        await this.stream.process(path);

        this.pending = false;
    }

    push(path: string, title = document.title) {
        history.pushState(
            { path, title },
            (document.title = title),
            this.prefix + path
        );
        return this.set(path);
    }

    static getInnerPath(link: HTMLAnchorElement) {
        const path = link.getAttribute('href');

        if (
            /^a(rea)?$/i.test(link.tagName) &&
            (link.target || '_self') === '_self' &&
            !path.match(/^\w+:/)
        )
            return path;
    }

    listen(root: EventTarget) {
        root.addEventListener('click', event => {
            const link = (event.target as HTMLElement).closest<
                HTMLAnchorElement
            >('a[href]');

            if (!link) return;

            const path = History.getInnerPath(link);

            if (!path) return;

            if (path.startsWith('#')) return scrollTo(path);

            event.preventDefault();

            this.push(path, link.title || link.textContent!.trim());
        });

        if (this.prefix === PathPrefix.hash)
            window.addEventListener('hashchange', () => this.set(this.path));

        window.addEventListener('popstate', ({ state }) => {
            const { path = this.path, title } = state || {};

            this.set(path, title);
        });

        setTimeout(() => this.set(this.path));

        return this;
    }
}
