import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import * as selectNavigation from '../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils/browser-assertions';
import * as routes from '../routes';
import registerPageView from './registerPageView';

declare const window: Window;

describe('registerPageView', () => {
  let hook: ReturnType<typeof registerPageView>;
  let client: GoogleAnalyticsClient;
  let mockGtag: any;
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;

  const action = {
    action: 'PUSH' as 'PUSH',
    location: {
      ...assertWindow().location,
      state: {},
    },
    match: {
      params: {
        book: {
          slug: 'book-slug-1',
        },
        page: {
          slug: 'test-page-1',
        },
      },
      route: routes.content,
      state: {},
    },
    query: {},
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    store = createTestStore();
    client = googleAnalyticsClient;
    mockGtag = jest.fn<Gtag.Gtag, []>();
    window.gtag = mockGtag;
    client.setTagIds(['foo']);

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = registerPageView(helpers);
  });

  it('registers a page view if pathname unchanged and modal query changed', async() => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({});

    await hook(action);
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/',
      queue_time: expect.any(Number),
      send_to: 'foo',
    });
  });

  it('registers a page view if pathname changed', async() => {
    jest.spyOn(selectNavigation, 'pathname').mockReturnValue('foo');

    await hook(action);
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: 'foo',
      queue_time: expect.any(Number),
      send_to: 'foo',
    });
  });

  it('does not register a page view if pathname and modal query are unchanged', async() => {
    await hook(action);
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/',
      queue_time: expect.any(Number),
      send_to: 'foo',
    });
    mockGtag.mockReset();
    await hook(action);
    expect(mockGtag).not.toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/',
      queue_time: expect.any(Number),
      send_to: 'foo',
    });
  });
});
