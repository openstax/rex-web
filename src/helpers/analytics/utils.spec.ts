import { Event, EventListener } from '@openstax/types/lib.dom';
import { assertDocument, assertWindow } from '../../app/utils/browser-assertions';
import { addInteractiveListeners } from './utils';
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
