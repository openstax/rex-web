import * as http from 'http';
import * as path from 'path';
import portfinder from 'portfinder';
import puppeteer from 'puppeteer';
import staticServer from 'serve-handler';

// jest-puppeteer will expose the `page` and `browser` globals to Jest tests.
// declare const browser: puppeteer.Browser
declare const page: puppeteer.Page;

describe('Browser sanity tests', () => {

    let devServer: http.Server | null = null;
    let devServerPort = 0;
    let consoleMessages: Array<{type: 'debug' | 'error' | 'info' | 'log' | 'warning', message: string}> = [];

    beforeAll(async() => {
        // pick an available port
        devServerPort = await portfinder.getPortPromise();

        devServer = http.createServer((request, response) => {
            staticServer(request, response, {public: path.join(__dirname, '../build')});
        });
        devServer.listen(devServerPort);
    });

    afterAll(async() => {
        if (devServer) {
            devServer.close();
        }
    });

    beforeEach(async() => {
        consoleMessages = [];

        page.on('console', (consoleMessage) => {
            const type = consoleMessage.type();
            const text = consoleMessage.text();

            switch (type) {
                case 'debug':
                case 'error':
                case 'info':
                case 'log':
                case 'warning':
                    consoleMessages.push({type, message: text});
                    break;
                default:
                    throw new Error(`BUG: Unsupported console type: '${type}'`);
            }
        });

        jest.setTimeout(5 * 60 * 1000); // dev browser takes a while to spin up

        const url = `http://localhost:${devServerPort}/`;

        await page.goto(url);
        // Wait until React has started
        await page.waitForSelector('#root > h1');

    });

    it('displays the "Hello developer" console text', async() => {
        const infoMessages = consoleMessages.filter(({type}) => type === 'info');
        expect(infoMessages.length).toBe(1);
        const str = [
            '%cHowdy! If you want to help out, the source code can be found at ',
            'https://github.com/openstax/books-web',
            ' font-weight:bold',
        ];
        expect(infoMessages[0].message).toBe(str.join(''));
    });

    it('loads the 404 page', async() => {
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
