import { createElement, Fragment } from '@bikeshaving/crank';
import { PageProps } from '../../source';

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
