import { assertDocument } from '../../../app/utils';
import { track } from './clickInput';

describe('clickInput', () => {
  const document = assertDocument();

  it('noops without label', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'button');
    const result = track({pathname: 'asdf'}, input);
    expect(result).toBeUndefined();
  });

  it('noops if input is not of type "button" or "submit"', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    const result = track({pathname: 'asdf'}, input);
    expect(result).toBeUndefined();
  });

  describe('google analytics', () => {
    it('reports label', () => {
      const input = document.createElement('input');
      input.setAttribute('aria-label', 'foo');
      input.setAttribute('type', 'button');
      const result = track({pathname: 'asdf'}, input);
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual('foo');
    });

    it('adds region to category', () => {
      const input = document.createElement('input');
      input.setAttribute('data-analytics-region', 'foo');
      input.setAttribute('aria-label', 'foo');
      input.setAttribute('type', 'submit');
      const result = track({pathname: 'asdf'}, input);
      if (!result) {
        return expect(result).toBeTruthy();
      } else if (!result.getGoogleAnalyticsPayload) {
        return expect(result.getGoogleAnalyticsPayload).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventCategory).toEqual('REX Input (foo)');
    });
  });
});
