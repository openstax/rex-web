import { track } from './signupCTA';

describe('signupCTA', () => {
  describe('google analytics', () => {
    it('reports open', () => {
      const result = track({pathname: 'asdf'}, 'open');
      if (!result) {
        return expect(result).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual('open');
    });

    it('reports close by navigation', () => {
      const result = track({pathname: 'asdf'}, 'close by navigating');
      if (!result) {
        return expect(result).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual('close by navigating');
    });
  });
});
