import { track } from './unload';

const pathname = '/some/path'

describe('unload', () => {

  describe('google analytics', () => {
    it('tracks unload', () => {
      const result = track({ pathname });
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload()).toEqual({
        eventAction: 'unload',
        eventCategory: 'REX unload',
        eventLabel: pathname,
        nonInteraction: true,
      });
    });
  });
});
