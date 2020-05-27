/* @jsx createElement */
import { createElement } from '@bikeshaving/crank';
import { renderer } from '@bikeshaving/crank/dom';
import { Router } from '../../source';

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
                { path: /Example/i, component: Page },
                {
                    path: 'sample',
                    resolver: () =>
                        new Promise(resolve =>
                            setTimeout(() => resolve(Page), 500)
                        )
                }
            ]}
            spinner={<div className="spinner">loading...</div>}
        />,
        document.body
    );
