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
