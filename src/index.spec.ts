import * as http from 'http';
import puppeteer from 'puppeteer';
import startServer from '../server';

class SinglePage {
    public readonly page: puppeteer.Page;
    public messages: {
        warning: string[]
        log: string[]
        info: string[]
        debug: string[]
        error: string[]
    };
    constructor(page: puppeteer.Page) {
        this.page = page;
        this.messages = {
            debug: [],
            error: [],
            info: [],
            log: [],
            warning: [],
        };
        // collect browser console messages to be checked later
        this.page.on('console', (consoleMessage) => {
            const type = consoleMessage.type();
            const text = consoleMessage.text();

            switch (type) {
                case 'debug':
                case 'error':
                case 'info':
                case 'log':
                case 'warning':
                    this.messages[type].push(text);
                    break;
                default:
                    throw new Error(`BUG: Unsupported console type: '${type}'`);
            }
        });

        this.page.on('pageerror', async(e) => {
            throw e;
        });
    }
}

async function startBrowser(browser: puppeteer.Browser, url: string) {

    const page = await browser.newPage();

    const wrapper = new SinglePage(page);
    await wrapper.page.goto(url);

    // Wait until React has started
    await wrapper.page.waitForSelector('#root > h1');
    return wrapper;
}

describe('Browser sanity tests', () => {

    let devServer: http.Server | null = null;
    let devServerPort = 0;
    let browser: puppeteer.Browser | null = null;
    let wrapper: SinglePage | null = null;

    beforeAll(async() => {
        await startServer({
          fallback404: true,
        }).then(({server, port}) => {
          devServer = server;
          devServerPort = port;
        });

        const puppeteerArgs = [];
        // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
        if (process.env.CI === 'true') {
            puppeteerArgs.push('--no-sandbox');
        }

        browser = await puppeteer.launch({
            args: puppeteerArgs,
            devtools: process.env.NODE_ENV === 'development',
        });

    });

    afterAll(async() => {
        if (devServer) {
            devServer.close();
        }
        if (browser) {
            await browser.close();
        }
    });

    // beforeEach does not seem to work well with async functions
    const before = async() => {
        jest.setTimeout(5 * 60 * 1000); // dev browser takes a while to spin up

        const url = `http://localhost:${devServerPort}/`;
        if (!browser) {
            throw new Error(`BUG: Browser has not been initialized. check beforeAll(...)`);
        }
        wrapper = await startBrowser(browser, url);
        return wrapper;
    };

    afterEach(async() => {
        if (wrapper) {
            await wrapper.page.close();
            wrapper = null;
        }
    });

    it('displays the "Hello developer" console text', async() => {
        const wrap = await before();
        expect(wrap.messages.info.length).toBe(1);
        const str = [
            '%cHowdy! If you want to help out, the source code can be found at ',
            'https://github.com/openstax/books-web',
            ' font-weight:bold',
        ];
        expect(wrap.messages.info[0]).toBe(str.join(''));
    });

    it('loads the 404 page', async() => {
        const {page} = await before();
        // const heading = await page.$eval('#root > h1', (el) => el.text)
        const heading = await (page.evaluate(() => {
            if (document) {
                const el = document.querySelector('#root > h1');
                if (el) {
                    return el.textContent;
                }
            }
        })) as string | null;
        expect(heading).toBe('page not found');
    });
});
