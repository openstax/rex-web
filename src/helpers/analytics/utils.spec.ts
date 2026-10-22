import { Event, EventListener } from '@openstax/types/lib.dom';
import { assertDocument, assertWindow } from '../../app/utils/browser-assertions';
import Cookies from 'js-cookie';
import { disableAnalyticsCookie } from './constants';
import { isK12Portal, resetK12PortalCache } from './k12Portal';
import { addInteractiveListeners, eventCaptureIsEnabled } from './utils';
import { stripHtml } from '../../app/utils';

describe('addInteractiveListeners', () => {
  const document = assertDocument();
  const window = assertWindow();
  let addEventListener: jest.SpyInstance;
  let handler: jest.SpyInstance;
  let windowListeners: { [event: string]: EventListener[] };

  beforeEach(() => {
    windowListeners = {};
    handler = jest.fn();
    addEventListener = jest.spyOn(window, 'addEventListener')
      .mockImplementation((event: string, listener) => {
        windowListeners[event] = [...(windowListeners[event] || []), listener as EventListener];
      });

    addInteractiveListeners(window, handler as any);
  });

  afterEach(() => {
    addEventListener.mockRestore();
  });

  describe('details', () => {
    it('captures open', () => {
      const summary = document.createElement('summary');
      const details = document.createElement('details');

      details.append(summary);

      const event = { target: summary } as unknown as Event;

      windowListeners.click.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(details, 'open');
    });

    it('captures close', () => {
      const summary = document.createElement('summary');
      const details = document.createElement('details');
      details.open = true;

      details.append(summary);

      const event = { target: summary } as unknown as Event;

      windowListeners.click.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(details, 'close');
    });

    it('noops without parent', () => {
      const summary = document.createElement('summary');
      const event = { target: summary } as unknown as Event;

      windowListeners.click.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(0);
    });

    it('noops if parent isn\'t details', () => {
      const summary = document.createElement('summary');
      const details = document.createElement('div');

      details.append(summary);

      const event = { target: summary } as unknown as Event;

      windowListeners.click.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(0);
    });
  });

  describe('anchors', () => {
    it('captures click', () => {
      const anchor = document.createElement('a');

      const event = { target: anchor } as unknown as Event;

      windowListeners.click.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(anchor, undefined);
    });
  });

  describe('iframes', () => {
    it('captures focus-in to iframe when window blurs and iframe is active element', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      iframe.focus();

      const event = { target: window } as unknown as Event;
      windowListeners.blur.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(iframe, 'focus-in');
    });

    it('captures focus-out of iframe when window focuses and iframe was previously active', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      iframe.focus();

      const event = { target: window } as unknown as Event;
      windowListeners.blur.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(iframe, 'focus-in');

      iframe.blur();
      windowListeners.focus.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(iframe, 'focus-out');

      windowListeners.focus.forEach((listener) => listener(event));

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('stripHtml', () => {
    it('returns empty string for empty input', () => {
      expect(stripHtml('')).toBe('');
    });

    it('returns plain text for plain text input', () => {
      expect(stripHtml('Hello world')).toBe('Hello world');
    });

    it('strips simple HTML tags', () => {
      expect(stripHtml('<b>Hello</b> <i>world</i>', true)).toBe('Hello world');
    });

    it('strips nested HTML tags', () => {
      expect(stripHtml('<div><span>Nested <b>text</b></span></div>', true)).toBe('Nested text');
    });

    it('collapses multiple spaces and trims', () => {
      expect(stripHtml('<div>   Hello    <b>world</b>   </div>', true)).toBe('Hello world');
    });

    it('Do not collapses multiple spaces and trims', () => {
      expect(stripHtml('<div>   Hello    <b>world</b>   </div>', false)).toBe('   Hello    world   ');
      expect(stripHtml('<div>   Hello    <b>world</b>   </div>')).toBe('   Hello    world   ');
    });

    it('returns empty string for HTML with only tags', () => {
      expect(stripHtml('<div><span></span></div>')).toBe('');
    });

    it('returns textContent if present', () => {
      const html = '<div>foo <b>bar</b></div>';
      expect(stripHtml(html)).toBe('foo bar');
    });
  });
});

describe('eventCaptureIsEnabled', () => {
  const window = assertWindow();
  const consentCookie = 'cookieyes-consent';
  const consent = (analytics: string) => `consentid:abc,consent:yes,action:yes,necessary:yes,analytics:${analytics}`;
  const loader = (industry: string, researchAgreementActive = false) => ({
    getSchoolDataFromPortalName: jest.fn(() => Promise.resolve({
      industry,
      research_agreement_active: researchAgreementActive,
    } as any)),
  });

  beforeEach(() => {
    resetK12PortalCache();
    Cookies.remove(consentCookie);
    Cookies.remove(disableAnalyticsCookie);
    window.history.pushState({}, '', '/books/some-book/pages/1-intro');
  });

  afterAll(() => {
    Cookies.remove(consentCookie);
    window.history.pushState({}, '', '/');
  });

  it('is disabled without a consent cookie', () => {
    expect(eventCaptureIsEnabled()).toBe(false);
  });

  it('is disabled when analytics is declined', () => {
    Cookies.set(consentCookie, consent('no'));
    expect(eventCaptureIsEnabled()).toBe(false);
  });

  it('is disabled when the consent cookie is malformed', () => {
    Cookies.set(consentCookie, 'garbage');
    expect(eventCaptureIsEnabled()).toBe(false);
  });

  it('does not match analytics:yes loosely', () => {
    Cookies.set(consentCookie, 'consentid:abc,xanalytics:yes,analytics:yesterday');
    expect(eventCaptureIsEnabled()).toBe(false);
  });

  it('is enabled when analytics is accepted', () => {
    Cookies.set(consentCookie, consent('yes'));
    expect(eventCaptureIsEnabled()).toBe(true);
  });

  it('is disabled when the opt-out cookie is set, even with consent', () => {
    Cookies.set(consentCookie, consent('yes'));
    Cookies.set(disableAnalyticsCookie, 'true');
    expect(eventCaptureIsEnabled()).toBe(false);
  });

  describe('on a portal path', () => {
    beforeEach(() => {
      Cookies.set(consentCookie, consent('yes'));
      window.history.pushState({}, '', '/portal/some-school/books/some-book/pages/1-intro');
    });

    it('is enabled while school data is pending', () => {
      isK12Portal({getSchoolDataFromPortalName: () => new Promise(() => undefined)} as any, 'some-school');
      expect(eventCaptureIsEnabled()).toBe(true);
    });

    it('is enabled when the portal was never looked up', () => {
      expect(eventCaptureIsEnabled()).toBe(true);
    });

    it('still needs consent when the school is not K12', () => {
      Cookies.set(consentCookie, consent('no'));
      expect(eventCaptureIsEnabled()).toBe(false);
    });

    it('is disabled for K12 schools', async() => {
      await isK12Portal(loader('K12'), 'some-school');
      expect(eventCaptureIsEnabled()).toBe(false);
    });

    it('is enabled for non-K12 schools', async() => {
      await isK12Portal(loader('HE'), 'some-school');
      expect(eventCaptureIsEnabled()).toBe(true);
    });

    it('is enabled when the school lookup fails', async() => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await isK12Portal({getSchoolDataFromPortalName: () => Promise.reject(new Error('x'))} as any, 'some-school');
      expect(eventCaptureIsEnabled()).toBe(true);
      error.mockRestore();
    });

    describe('for a K12 school with an active research agreement', () => {
      beforeEach(async() => {
        await isK12Portal(loader('K12', true), 'some-school');
      });

      it('is enabled without a consent cookie', () => {
        Cookies.remove(consentCookie);
        expect(eventCaptureIsEnabled()).toBe(true);
      });

      it('is enabled even when analytics was declined elsewhere', () => {
        Cookies.set(consentCookie, consent('no'));
        expect(eventCaptureIsEnabled()).toBe(true);
      });

      it('is disabled when the opt-out cookie is set', () => {
        Cookies.set(disableAnalyticsCookie, 'true');
        expect(eventCaptureIsEnabled()).toBe(false);
      });
    });
  });
});
