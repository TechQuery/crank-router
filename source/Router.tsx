import {
    Props,
    Component,
    Context,
    createElement,
    Child,
    Children
} from '@bikeshaving/crank';
import { HTMLProps } from 'web-utility/source/DOM-type';

import { PathMode, History } from './History';
import { parsePath, watchStop } from './utility';

export interface PageProps extends Props {
    path: string;
    history: History;
}

export type PageComponent = (props: PageProps) => ReturnType<Component>;

export interface Route {
    path: string | RegExp;
    component?: PageComponent;
    resolver?: () => Promise<PageComponent>;
}

export interface RouterProps extends HTMLProps, Props {
    mode?: PathMode;
    map: Route[];
    startClass?: string;
    endClass?: string;
    spinner?: Children;
}

export async function* Router(
    this: Context,
    {
        mode,
        map,
        className,
        children,
        spinner,
        startClass,
        endClass
    }: RouterProps
): AsyncGenerator<Child, any, HTMLElement> {
    const root = yield <div className={className} />;

    const history = new History(mode).listen(root);

    var last: { path: string; component: PageComponent } | undefined;

    map.sort(({ path: A }, { path: B }) => (B + '').localeCompare(A + ''));

    for await (const {
        data,
        defer: { resolve }
    } of history.stream.observable) {
        const item = map.find(({ path }) =>
            typeof path === 'string' ? data.startsWith(path) : path.test(data)
        );

        if (!item) {
            yield <div className={className}>{children}</div>;
            resolve();
            continue;
        }

        const lastTree = last && (
            <last.component {...parsePath(last.path)} history={history} />
        );

        if (!item.component) {
            if (spinner)
                yield (
                    <div className={className}>
                        {lastTree && (
                            <div crank-key={last.path}>{lastTree}</div>
                        )}
                        {spinner}
                    </div>
                );
            item.component = await item.resolver();
        }

        const nextTree = (
            <item.component {...parsePath(data)} history={history} />
        );

        if (last && startClass && endClass) {
            const [startCSS, endCSS] =
                history.compare(last.path, data) < 0
                    ? [startClass, endClass]
                    : [endClass, startClass];

            const {
                firstElementChild: lastPage,
                lastElementChild: nextPage
            } = yield (
                <div className={className}>
                    <div crank-key={last.path} className={endCSS}>
                        {lastTree}
                    </div>
                    <div crank-key={data} className={startCSS}>
                        {nextTree}
                    </div>
                </div>
            );
            const lastEnd = watchStop(lastPage as HTMLElement),
                nextEnd = watchStop(nextPage as HTMLElement);

            yield (
                <div className={className}>
                    <div crank-key={last.path} className={endCSS}>
                        {lastTree}
                    </div>
                    <div crank-key={data}>{nextTree}</div>
                </div>
            );
            await Promise.all([lastEnd, nextEnd]);
        }

        yield (
            <div className={className}>
                <div crank-key={data}>{nextTree}</div>
            </div>
        );
        last = { path: data, component: item.component };
        resolve();
    }
}
