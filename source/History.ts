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
    paths: string[] = [];
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

    async set(path: string, title = document.title) {
        if (this.paths.indexOf(path) < 0) this.paths.push(path);

        await this.stream.process(path);

        document.title = title;
    }

    push(path: string, title = document.title) {
        history.pushState(
            { path, title },
            (document.title = title),
            this.prefix + path
        );
        return this.set(path);
    }

    compare(last: string, next: string) {
        for (const path of this.paths)
            if (last === path) return -1;
            else if (next === path) return 1;

        return 0;
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

    private popping = false;

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
            window.addEventListener(
                'hashchange',
                () => this.popping || this.set(this.path)
            );

        window.addEventListener('popstate', async ({ state }) => {
            const { path = this.path, title } = state || {};

            this.popping = true;

            await this.set(path, title);

            this.popping = false;
        });

        setTimeout(() => this.set(this.path));

        return this;
    }
}
