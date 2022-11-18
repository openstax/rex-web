import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { receiveLoggedOut } from '../actions';
import { untrackUserHookBody } from './untrackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGtag: any;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGtag = jest.fn<Gtag.Gtag, []>();
    window.gtag = mockGtag;
    client.setTagIds(['foo']);
  });

  it('stops tracking the user', async() => {
    const helpers: any = undefined; // unused by hook

    await (untrackUserHookBody(helpers))(receiveLoggedOut());

    expect(mockGtag).toHaveBeenCalledWith('config', 'foo', { user_id: undefined, queue_time: 0 });
  });
});
