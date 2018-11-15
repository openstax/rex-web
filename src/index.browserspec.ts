/** @jest-environment puppeteer */
import { navigate, page } from './test/browserutils';

describe('Browser sanity tests', () => {

    let consoleMessages: Array<{type: 'debug' | 'error' | 'info' | 'log' | 'warning', message: string}> = [];

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

        await navigate(page, '/');
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
