import { resetModules } from '../../../test/utils';
import { locationChange } from '../../navigation/actions';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../types';
import { assertNotNull } from '../../utils';

describe('setHead hook', () => {
  let hookBody: ActionHookBody<typeof locationChange>;
  const helpers = {} as MiddlewareAPI & AppServices;
  const action = locationChange({location: {...new URL('http://localhost/'), state: {}}, action: 'PUSH'});

  beforeEach(() => {
    resetModules();
  });

  describe('in a browser', () => {
    beforeEach(() => {
      hookBody = require('./locationChange').hookBody;
    });

    it('removes meta', () => {
      if (typeof(document) === 'undefined') {
        return expect(document).toBeTruthy();
      }
      const head = assertNotNull(document.head, 'document must have a head');

      for (let i = 0; i < 5; i++) {
        const tag = document.createElement('meta');
        tag.setAttribute('data-rex-page', '');
        head.appendChild(tag);
      }

      expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(5);
      hookBody(helpers)(action);
      expect(head.querySelectorAll('meta[data-rex-page]').length).toEqual(0);
    });
  });

  describe('outside the browser', () => {
    const documentBackup = document;
    const windowBackup = window;

    beforeEach(() => {
      delete (global as any).document;
      delete (global as any).window;
      hookBody = require('./locationChange').hookBody;
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
