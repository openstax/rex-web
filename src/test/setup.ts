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

// set default timeout to something quite large in CI
if (process.env.CI) {
  jest.setTimeout(120000);
} else {
  jest.setTimeout(15000);
}
