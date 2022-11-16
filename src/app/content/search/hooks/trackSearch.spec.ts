import { GoogleAnalyticsClient } from '../../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import analytics from '../../../../helpers/analytics';
import { AppServices, AppState, MiddlewareAPI } from '../../../types';
import { requestSearch } from '../actions';
import { trackSearchHookBody } from './trackSearch';

declare const window: Window;

describe('trackSearch', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
    client.setTrackingIds(['foo']);
  });

  it('tracks the search for a known book', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', expect.objectContaining({
      eventAction: 'a query',
      eventCategory: 'REX search',
      eventLabel: 'algebra',
      hitType: 'event',
    }));
  });

  it('tracks the search when the book is not available', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', expect.objectContaining({
      eventAction: 'a query',
      eventCategory: 'REX search',
      eventLabel: 'unknown',
      hitType: 'event',
    }));
  });

  it('does not tracks the search for page reload', async() => {
    const helpers = ({
      analytics,
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query', {isResultReload: true}));
    expect(mockGa).not.toHaveBeenCalled();
  });
});
