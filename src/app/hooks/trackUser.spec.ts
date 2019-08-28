import { GoogleAnalyticsClient } from '../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { receiveUser } from '../auth/actions';
import { User } from '../auth/types';
import { trackUserHookBody } from './trackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;
  const helpers: any = undefined; // unused by hook
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

  it('tracks the user in GDPR', async() => {
    user.isNotGdprLocation = false;
    await (trackUserHookBody(helpers))(receiveUser(user));
    expect(mockGa).not.toHaveBeenCalled();
  });
});
