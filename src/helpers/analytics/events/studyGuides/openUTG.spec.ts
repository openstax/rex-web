import * as selectNavigation from '../../../../app/navigation/selectors';
import { selector, track } from './openUTG';

describe('openUTG analytics event', () => {
  describe('selector', () => {
    it('returns an object with pathname from selectNavigation', () => {
      const pathname = '/study-guides/utg';
      jest.spyOn(selectNavigation, 'pathname').mockReturnValue(pathname);

      // Reselect selectors are called as selector(state)
      const result = selector.resultFunc(pathname);
      expect(result).toEqual({ pathname });
    });
  });

  describe('track', () => {
    it('returns an AnalyticsEvent with correct payload', () => {
      const pathname = '/study-guides/utg';
      const event = track({ pathname });
      expect(event).toBeDefined();
      expect(typeof event!.getGoogleAnalyticsPayload).toBe('function');
      let payload;
      if (event) {
        if (typeof event.getGoogleAnalyticsPayload === 'function') {
          payload = event.getGoogleAnalyticsPayload();
          expect(payload).toEqual({
            eventAction: 'button',
            eventCategory: 'REX Study guides (open UTG)',
            eventLabel: pathname,
          });
        } else {
          fail('event.getGoogleAnalyticsPayload is undefined');
        }
      } else {
        fail('event is undefined');
      }
    });
  });
});