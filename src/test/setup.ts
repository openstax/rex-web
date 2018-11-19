import { MatchImageSnapshotOptions, toMatchImageSnapshot } from 'jest-image-snapshot';
import toMatchScreenshot from './matchers/toMatchScreenshot';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchScreenshot(config: {[key: string]: MatchImageSnapshotOptions}): R;
      toMatchImageSnapshot(config: MatchImageSnapshotOptions): R;
    }
  }
}
expect.extend({
  toMatchImageSnapshot,
  toMatchScreenshot,
});
