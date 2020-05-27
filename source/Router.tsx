import {
    Props,
    Component,
    Context,
    createElement,
    Child
} from '@bikeshaving/crank';
import { HTMLProps } from 'web-utility/source/DOM-type';

import { History } from './History';
import { parsePath, watchStop } from './utility';

export interface PageProps extends Props {
    path: string;
    history: History;
}

export type PageComponent = (props: PageProps) => ReturnType<Component>;

export interface Route {
    path: string | RegExp;
    component: PageComponent;
}

export interface RouterProps extends HTMLProps, Props {
    map: Route[];
    startClass?: string;
    endClass?: string;
}

export async function* Router(
    this: Context,
    { map, className, children, startClass, endClass }: RouterProps
): AsyncIterator<Child, any, HTMLElement> {
    const root = yield <div className={className} />;

    const history = new History().listen(root);

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

        const nextTree = (
            <item.component {...parsePath(data)} history={history} />
        );

        if (last && startClass && endClass) {
            const [startCSS, endCSS] =
                    history.compare(last.path, data) < 0
                        ? [startClass, endClass]
                        : [endClass, startClass],
                lastTree = (
                    <last.component
                        {...parsePath(last.path)}
                        history={history}
                    />
                );
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
