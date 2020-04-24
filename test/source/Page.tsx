import { createElement, Fragment } from '@bikeshaving/crank';
import { PageProps } from '../../source';

const Color = {
    test: 'lightblue',
    example: 'pink'
};

export function Page({ path }: PageProps) {
    return (
        <Fragment>
            <nav style={{ background: Color[path] }}>
                <a href="test">Test</a>
                <a href="example">Example</a>
            </nav>
            <main>Current path: {path}</main>
        </Fragment>
    );
}
