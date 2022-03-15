import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import * as selectNavigation from '../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../types';
import * as routes from '../routes';
import registerPageView from './registerPageView';

declare const window: Window;

describe('registerPageView', () => {
    let hook: ReturnType<typeof registerPageView>;
    let client: GoogleAnalyticsClient;
    let mockGa: any;
    let store: Store;
    let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;

    const action = {
      action: 'PUSH' as 'PUSH',
      location: {...new URL('http://localhost/'), state: {}},
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
      prevLocation: {
        hash: '',
        pathname: '/',
        query: {
          modal: 'SG',
        },
        search: '',
        state: '',
      },
      query: {},
    };

    beforeEach(() => {
      store = createTestStore();
      client = googleAnalyticsClient;
      mockGa = jest.fn<UniversalAnalytics.ga, []>();
      window.ga = mockGa;
      client.setTrackingIds(['foo']);

      helpers = {
        ...createTestServices(),
        dispatch: store.dispatch,
        getState: store.getState,
      };

      hook = registerPageView(helpers);
    });

    it('registers a page view if pathname unchanged and modal query changed', async() => {
      jest.spyOn(selectNavigation, 'query').mockReturnValue({});
      jest.spyOn(selectNavigation, 'pathname').mockReturnValue('/');

      await hook(action);
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {hitType: 'pageview', page: '/'});
    });

    it('registers a page view if pathname changed', async() => {
      jest.spyOn(selectNavigation, 'query').mockReturnValue({});
      jest.spyOn(selectNavigation, 'pathname').mockReturnValue('foo');

      await hook(action);
      expect(mockGa).toHaveBeenCalledWith('tfoo.send', {hitType: 'pageview', page: 'foo'});
    });

    it('does not register a page view if pathname unchanged and modal query unchanged', async() => {
      jest.spyOn(selectNavigation, 'query').mockReturnValue({});
      jest.spyOn(selectNavigation, 'pathname').mockReturnValue('/');

      const otherAction = {...action, prevLocation: {...action.prevLocation, hash: '123', query: {}}};

      await hook(otherAction);
      expect(mockGa).not.toHaveBeenCalled();
    });
  });
