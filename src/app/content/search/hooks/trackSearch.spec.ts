import { GoogleAnalyticsClient } from '../../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import analytics from '../../../../helpers/analytics';
import { AppServices, AppState, MiddlewareAPI } from '../../../types';
import { requestSearch } from '../actions';
import { trackSearchHookBody } from './trackSearch';

declare const window: Window;

describe('trackSearch', () => {
  let client: GoogleAnalyticsClient;
  let mockGtag: any;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGtag = jest.fn<Gtag.Gtag, []>();
    window.gtag = mockGtag;
    client.setTagIds(['foo']);
  });

  it('tracks the search for a known book', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGtag).toHaveBeenCalledWith('event', 'a query', expect.objectContaining({
      event_category: 'REX search',
      event_label: 'algebra',
      queue_time: 0,
      send_to: 'foo',
    }));
  });

  it('tracks the search when the book is not available', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGtag).toHaveBeenCalledWith('event', 'a query', expect.objectContaining({
      event_category: 'REX search',
      event_label: 'unknown',
      queue_time: 0,
      send_to: 'foo',
    }));
  });

  it('does not tracks the search for page reload', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query', {isResultReload: true}));
    expect(mockGtag).not.toHaveBeenCalled();
  });
});
