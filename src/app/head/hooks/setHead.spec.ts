import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { assertDefined } from '../../utils';
import { setHead } from '../actions';

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof setHead>;
  const helpers = {} as MiddlewareAPI & AppServices;
  const action = setHead({
    meta: [{name: 'fake', content: 'meta'}],
    title: 'cool title',
  });

  beforeEach(() => {
    hookBody = require('./setHead').hookBody;
  });

  it('adds meta', () => {
    if (typeof(document) === 'undefined') {
      return expect(document).toBeTruthy();
    }
    const head = assertDefined(document.head, 'document must have a head');

    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(0);
    hookBody(helpers)(action);
    expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(1);
  });

  it('sets the title', () => {
    if (typeof(document) === 'undefined') {
      expect(document).toBeTruthy();
    } else {
      hookBody(helpers)(action);
      expect(document.title).toEqual('cool title');
    }
  });

  it.skip('sets the og:title', () => {
    if (typeof(document) === 'undefined') {
      expect(document).toBeTruthy();
    } else {
      hookBody(helpers)(action);
      const titles = document.querySelectorAll('meta[property="og:title"]');
      expect(titles.length).toBe(1);
      expect(titles[0].getAttribute('content')).toEqual('cool title');
    }
  });

  it('sets the og:description using the content text', () => {
    if (typeof(document) === 'undefined') {
      expect(document).toBeTruthy();
    } else {
      const main = document.createElement('div');
      main.setAttribute('id', 'main-content');
      main.innerHTML = `this <b>is a test</b> with "content" that is more
than 160 characters long to verify that the text is trimmed to be
short enough to act as a preview when the link is shared on social
media and unfurled.`;

      document.body.appendChild(main);
      hookBody(helpers)(action);
      const descriptions = document.querySelectorAll('meta[property="og:description"]');
      expect(descriptions.length).toBe(1);
      expect(descriptions[0].getAttribute('content')).toEqual(`this is a test with "content" that is more
than 160 characters long to verify that the text is trimmed to be
short enough to act as a preview when the link`);
    }
  });

  describe('outside the browser', () => {
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBackup;
    });

    it('doesn\'t break', () => {
      let error: Error | null = null;

      try {
        hookBody(helpers)(action);
      } catch (e) {
        error = e;
      }

      expect(error).toEqual(null);
    });
  });
});
