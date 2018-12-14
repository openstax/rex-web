import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import toMatchImageSnapshot from './matchers/toMatchImageSnapshot';

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
console.error = (msg) => {  // tslint:disable-line:no-console
  const shouldIgnore = !!ignoreConsoleMessages.find((ignore) => msg.indexOf(ignore) === 0);

  if (shouldIgnore) {
    return;
  }

  originalConsoleError(msg);
};

// set default timeout to something quite large in CI
if (process.env.CI) {
  jest.setTimeout(90 * 1000);
} else {
  jest.setTimeout(30 * 1000);
}
