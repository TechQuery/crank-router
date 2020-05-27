import WebServer from 'koapache';
import { Browser, Page, launch } from 'puppeteer-core';

const { npm_config_chrome } = process.env;

var server: string, browser: Browser, page: Page;

export async function bootServer() {
    if (server) return server;

    const { address, port } = await new WebServer({
        staticPath: 'docs/demo/'
    }).workerHost();

    return (server = `http://${address}:${port}/`);
}

export async function getPage(path: string) {
    browser = browser || (await launch({ executablePath: npm_config_chrome }));

    page = page || (await browser.pages())[0];

    await page.goto(path);

    return page;
}

export async function expectPage(title: string, path: string, content: string) {
    const data = await page.$eval('body', body => ({
        title: document.title,
        path: location.hash,
        content: body.innerHTML
    }));

    expect(data.title).toBe(title);
    expect(data.path).toBe(path);
    expect(data.content).toMatch(content);
}

export function delay(seconds = 0.1) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
