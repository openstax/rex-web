import { assertDocument } from '../../../app/utils';
import { track } from './clickLink';

describe('clickLink', () => {
  const document = assertDocument();

  it('noops without href', () => {
    const anchor = document.createElement('a');
    const result = track({pathname: 'asdf'}, anchor);
    expect(result).toBeUndefined();
  });

  describe('google analytics', () => {

    it('reports href', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'foo');
      const result = track({pathname: 'asdf'}, anchor);
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual('foo');
    });

    it('adds region to category', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('data-analytics-region', 'foo');
      anchor.setAttribute('href', 'foo');
      const result = track({pathname: 'asdf'}, anchor);
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventCategory).toEqual('REX Link (foo)');
    });
  });
});
