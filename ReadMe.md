# Crank Router

**Router component** for [Crank engine][1], which is based on [Iterable Observer][2].

[![NPM Dependency](https://david-dm.org/TechQuery/crank-router.svg)][3]
[![API Document](https://github.com/TechQuery/crank-router/workflows/API%20Document/badge.svg?branch=master)][4]

[![NPM](https://nodei.co/npm/crank-router.png?downloads=true&downloadRank=true&stars=true)][5]

## Feature

-   **Page Link** (support `<a />`, `<area />` & `<form />`)

    -   `<a href="route/path">Page title</a>`
    -   `<a href="route/path" title="Page title" target="_self">Example page</a>`
    -   `<a href="#page-section">Page section</a>` (Scroll to an Anchor smoothly)
    -   `<form method="get" action="route/path" />` (Form Data processed by `URLSearchParams`)

-   **Path Mode**: `location.hash` (default) & `history.pushState()`

-   **Async Loading** (recommend to use with `import()` ECMAScript proposal)

## Installation

```shell
npm install @bikeshaving/crank crank-router \
    iterable-observer web-utility
```

## Example

-   [Source code](https://github.com/TechQuery/crank-router/tree/master/test/source)

-   [Online preview](https://tech-query.me/crank-router/demo/)

`index.tsx`

```jsx
import { createElement } from '@bikeshaving/crank';
import { renderer } from '@bikeshaving/crank/dom';
import { Router } from 'crank-router/source';

import { Page } from './Page';

window.onload = () =>
    renderer.render(
        <Router
            className="router"
            startClass="start"
            endClass="end"
            map={[
                { path: '', component: Page },
                { path: 'test', component: Page },
                { path: /Example/i, component: Page }
            ]}
        />,
        document.body
    );
```

`Page.tsx`

```jsx
import { createElement, Fragment } from '@bikeshaving/crank';
import { PageProps } from 'crank-router/source';

const Color = {
    test: 'lightblue',
    example: 'pink'
};

export function Page({ path, history, ...data }: PageProps) {
    return (
        <Fragment>
            <nav>
                <a href="test?id=1">Test</a>
                <a href="example?id=2">Example</a>
            </nav>
            <ul style={{ background: Color[path] }}>
                <li>path: {path}</li>
                <li>data: {JSON.stringify(data)}</li>
            </ul>
        </Fragment>
    );
}
```

`index.less`

```LESS
body {
    margin: 0;
}
nav > a {
    display: inline-block;
    margin: 0.5rem;
}
.router {
    width: 100vw;
    height: 100vh;
    overflow: auto;
    position: relative;
    & > * {
        position: absolute;
        top: 0;
        left: 0;
        transform: translateX(0);
        opacity: 1;
        transition: 0.5s;
    }
    .start {
        transform: translateX(100%);
        opacity: 0;
    }
    .end {
        transform: translateX(-100%);
        opacity: 0;
    }
}
```

## Inspiration

-   https://github.com/bikeshaving/crank/issues/27#issuecomment-617633472

-   https://github.com/EasyWebApp/cell-router

[1]: https://crank.js.org/
[2]: https://web-cell.dev/iterable-observer/
[3]: https://david-dm.org/TechQuery/crank-router
[4]: https://github.com/TechQuery/crank-router/actions
[5]: https://nodei.co/npm/crank-router/
