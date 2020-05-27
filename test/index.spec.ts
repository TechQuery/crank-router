import { Page } from 'puppeteer-core';
import { bootServer, getPage, expectPage, delay } from './browser';

var server: string, page: Page;

describe('Crank Router', () => {
    beforeAll(async () => {
        server = await bootServer();

        page = await getPage(server);
    });

    it('should render a Page of default Path', () =>
        expectPage(
            'Crank Router demo',
            '',
            '<div class="router"><div><nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul><li>path: </li><li>data: {}</li></ul></div></div>'
        ));

    it('should render a Page based on String pattern', async () => {
        await page.click('a[href]:first-child');

        await delay(0.5);

        await expectPage(
            'Test',
            '#test?id=1',
            '<nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul style="background: lightblue;"><li>path: test</li><li>data: {"id":1}</li></ul>'
        );
    });

    it('should render a Page based on RegExp pattern', async () => {
        await page.click('a[href]:last-child');

        await delay(0.5);

        await expectPage(
            'Example',
            '#example?id=2',
            '<nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul style="background: pink;"><li>path: example</li><li>data: {"id":2}</li></ul>'
        );
    });

    it('should render an old Page while going back', async () => {
        await page.goBack();

        await delay(0.5);

        await expectPage(
            'Test',
            '#test?id=1',
            '<nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul style="background: lightblue;"><li>path: test</li><li>data: {"id":1}</li></ul>'
        );
    });

    it('should render an old Page while reloading', async () => {
        await page.reload();

        await delay(0.5);

        await expectPage(
            'Test',
            '#test?id=1',
            '<nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul style="background: lightblue;"><li>path: test</li><li>data: {"id":1}</li></ul>'
        );
    });

    it('should render an old Page based on History state', async () => {
        await page.goForward();

        await delay(0.5);

        await expectPage(
            'Example',
            '#example?id=2',
            '<nav><a href="test?id=1">Test</a><a href="example?id=2">Example</a></nav><ul style="background: pink;"><li>path: example</li><li>data: {"id":2}</li></ul>'
        );
    });
});
