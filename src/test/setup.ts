import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import 'jest-styled-components';
import toMatchImageSnapshot from './matchers/toMatchImageSnapshot';

jest.mock('cnx-recipes', () => ({
  getBookStyles: () => {
    const styles = new Map();
    styles.set('intro-business', '/* mocked book style */');
    return styles;
  },
}));

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot(config: {[key: string]: MatchImageSnapshotOptions}): R;
    }
  }
}
expect.extend({
  toMatchImageSnapshot,
});

jest.mock('ally.js/style/focus-within');

const ignoreConsoleMessages = [
  /*
   * jsdom chokes on cnx-recipes styles and produces large nasty
   * error messages. the styles are valid, jsdom's css parser
   * is incomplete, so hide these messages
   */
  'Error: Could not parse CSS stylesheet',
  /*
   * jsdom doesn't implement scrolling
   */
  'Error: Not implemented: window.scrollTo',
];

const originalConsoleError = console.error;  // tslint:disable-line:no-console
console.error = (msg: string) => {  // tslint:disable-line:no-console
  const shouldIgnore = !!ignoreConsoleMessages.find((ignore) => msg.indexOf(ignore) === 0);

  if (shouldIgnore) {
    return;
  }

  originalConsoleError(msg);
};

if (process.env.CI) {
  // set default timeout to something quite large in CI
  jest.setTimeout(90 * 1000);
} else {
  jest.setTimeout(120 * 1000);
}
