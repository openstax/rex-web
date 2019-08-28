import { GoogleAnalyticsClient } from '../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { receiveUser } from '../auth/actions';
import { User } from '../auth/types';
import { doAcceptCookies } from '../notifications/acceptCookies';
import { trackUserHookBody } from './trackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;
  const helpers: any = {dispatch: jest.fn()};
  let user: User;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
    client.setTrackingIds(['foo']);
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'a_uuid'};
  });

  it('tracks the user not in GDPR', async() => {
    user.isNotGdprLocation = true;
    await (trackUserHookBody(helpers))(receiveUser(user));
    expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userId', 'a_uuid');
  });

  it('does not track the user in GDPR', async() => {
    user.isNotGdprLocation = false;
    await (trackUserHookBody(helpers))(receiveUser(user));
    expect(mockGa).not.toHaveBeenCalled();
  });

  it('tracks if accept cookies not needed', async() => {
    doAcceptCookies();
    user.isNotGdprLocation = true;
    await (trackUserHookBody(helpers))(receiveUser(user));
    expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userId', 'a_uuid');
  });
});
