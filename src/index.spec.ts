import * as http from 'http';
import * as path from 'path';
import portfinder from 'portfinder';
import puppeteer from 'puppeteer';
import staticServer from 'serve-handler';

class SinglePage {
    public readonly page: puppeteer.Page;
    public messages: {
        warning: string[]
        log: string[]
        info: string[]
        debug: string[]
        error: string[]
    };
    private readonly browser: puppeteer.Browser;
    constructor(browser: puppeteer.Browser, page: puppeteer.Page) {
        this.browser = browser;
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

    public async close() {
        await this.browser.close();
    }
}

async function startBrowser(url: string) {

    const puppeteerArgs = [];
    // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
    if (process.env.CI === 'true') {
        puppeteerArgs.push('--no-sandbox');
    }

    const browser = await puppeteer.launch({
        args: puppeteerArgs,
        devtools: process.env.NODE_ENV === 'development',
    });
    const page = await browser.newPage();

    const wrapper = new SinglePage(browser, page);
    await wrapper.page.goto(url);

    // Wait until React has started
    await wrapper.page.waitForSelector('#root > h1');
    return wrapper;
}

describe('Browser sanity tests', () => {

    let devServer: http.Server | null = null;
    let devServerPort = 0;
    let wrapper: SinglePage | null = null;

    beforeAll(async() => {
        // pick an available port
        devServerPort = await portfinder.getPortPromise();

        devServer = http.createServer((request, response) => {
            staticServer(request, response, {public: path.join(__dirname, '../build')});
        });
        devServer.listen(devServerPort);
    })

    afterAll(async() => {
        if (devServer) {
            devServer.close();
        }
    })

    // beforeEach does not seem to work well with async functions
    const before = async() => {
        jest.setTimeout(5 * 60 * 1000); // dev browser takes a while to spin up

        const url = `http://localhost:${devServerPort}/`;
        wrapper = await startBrowser(url);
        return wrapper;
    };

    afterEach(async() => {
        if (wrapper) {
            await wrapper.close();
            wrapper = null;
        }
    });

    it('displays the "Hello developer" console text', async() => {
        const wrap = await before();
        expect(wrap.messages.info.length).toBe(1);
        expect(wrap.messages.info[0]).toBe('%cHowdy! If you want to help out, the source code can be found at https://github.com/openstax/books-web font-weight:bold');
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
