import {
    Props,
    Component,
    Context,
    createElement,
    Child
} from '@bikeshaving/crank';
import { HTMLProps } from 'web-utility/source/DOM-type';

import { History } from './History';
import { watchStop } from './utility';

export interface PageProps extends Props {
    path: string;
}

export type PageComponent = (props: PageProps) => ReturnType<Component>;

export interface Route {
    path: string;
    component: PageComponent;
}

export interface RouterProps extends HTMLProps, Props {
    map: Route[];
    startClass?: string;
    endClass?: string;
}

interface CachedRoute extends Route {
    element: HTMLElement;
}

export async function* Router(
    this: Context,
    { map, className, children, startClass, endClass }: RouterProps
): AsyncIterator<Child, any, HTMLElement> {
    const history = new History().listen(this);
    var last: CachedRoute | undefined;

    map.sort(({ path: A }, { path: B }) => B.localeCompare(A));

    for await (const {
        data,
        defer: { resolve }
    } of history.stream.observable) {
        const item = map.find(({ path }) => data.startsWith(path));

        if (!item) {
            yield <div className={className}>{children}</div>;
            resolve();
            continue;
        }

        if (last && startClass && endClass) {
            const lastEnd = watchStop(last.element);

            const { lastElementChild: next } = yield (
                <div className={className}>
                    <div className={endClass} crank-key={endClass}>
                        <last.component path={last.path} />
                    </div>
                    <div className={startClass} crank-key={startClass}>
                        <item.component path={data} />
                    </div>
                </div>
            );
            const nextEnd = watchStop(next as HTMLElement);

            yield (
                <div className={className}>
                    <div className={endClass} crank-key={endClass}>
                        <last.component path={last.path} />
                    </div>
                    <div crank-key={startClass}>
                        <item.component path={data} />
                    </div>
                </div>
            );
            await Promise.all([lastEnd, nextEnd]);
        }

        const next = yield (
            <div className={className}>
                <div>
                    <item.component path={data} />
                </div>
            </div>
        );
        last = {
            path: data,
            component: item.component,
            element: next.lastElementChild as HTMLElement
        };
        resolve();
    }
}
