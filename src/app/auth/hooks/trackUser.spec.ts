import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { receiveUser } from '../actions';
import { User } from '../types';
import { trackUserHookBody } from './trackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGtag: any;
  const dispatchMock = jest.fn();
  const helpers: any = {dispatch: dispatchMock};
  let user: User;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGtag = jest.fn<Gtag.Gtag, []>();
    window.gtag = mockGtag;
    client.setTagIds(['foo']);
    user = {firstName: 'test', isNotGdprLocation: true, lastName: 'test', uuid: 'a_uuid'};
    jest.resetAllMocks();
  });

  describe('user not in GDPR', () => {
    beforeEach(() => {
      user.isNotGdprLocation = true;
    });

    describe('user already accepted Cookies', () => {

      it('tracks the user', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          queue_time: 0, send_page_view: false, user_id: 'a_uuid',
        });
      });

      it('does not prompt to accept cookies', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(dispatchMock).not.toHaveBeenCalled();
      });
    });

    describe('user not yet accepted cookies', () => {

      it('tracks the user', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(mockGtag).toHaveBeenCalledWith('config', 'foo', {
          queue_time: 0, send_page_view: false, user_id: 'a_uuid',
        });
      });

      describe('with CookieYes', () => {
        afterEach(() => {
          delete window.cookieYesActive;
        });

        it('doesn\'t prompt if CookieYes is running', async() => {
          window.cookieYesActive = true;
          await (trackUserHookBody(helpers))(receiveUser(user));
          expect(dispatchMock).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('user in the GDPR', () => {
    beforeEach(() => {
      user.isNotGdprLocation = false;
    });

    it('does not track the user', async() => {
      await (trackUserHookBody(helpers))(receiveUser(user));
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('does not prompt to accept cookies', async() => {
      await (trackUserHookBody(helpers))(receiveUser(user));
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });

});
