import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { assertDocument, assertNotNull } from '../../utils';
import { setHead } from '../actions';

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof setHead>;
  const helpers = {} as MiddlewareAPI & AppServices;
  const action = setHead({
    contentTags: [],
    links: [{rel: 'canonical', href: 'justfortesting'}],
    meta: [{name: 'fake', content: 'meta'}],
    title: 'cool title',
  });

  beforeEach(() => {
    hookBody = require('./setHead').hookBody;
    assertNotNull(assertDocument().head, 'document must have a head').innerHTML = '';
  });

  it('adds link', () => {
    if (typeof(document) === 'undefined') {
      return expect(document).toBeTruthy();
    }
    const head = assertNotNull(document.head, 'document must have a head');

    expect(head.querySelectorAll('link[data-rex-page]').length).toEqual(0);
    hookBody(helpers)(action);
    expect(head.querySelectorAll('link[data-rex-page]').length).toEqual(1);
  });

  it('adds meta', () => {
    if (typeof(document) === 'undefined') {
      return expect(document).toBeTruthy();
    }
    const head = assertNotNull(document.head, 'document must have a head');

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

  describe('outside the browser', () => {
    const documentBackup = document;
    const windowBackup = window;

    beforeEach(() => {
      delete (global as any).document;
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).document = documentBackup;
      (global as any).window = windowBackup;
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
