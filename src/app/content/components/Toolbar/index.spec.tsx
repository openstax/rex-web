import { noop } from 'lodash/fp';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Toolbar from '.';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import TestContainer from '../../../../test/TestContainer';
import * as Services from '../../../context/Services';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { closeMobileMenu } from '../../actions';
import { openToc } from '../../actions';
import { practiceQuestionsFeatureFlag } from '../../constants';
import { SearchResult } from '@openstax/open-search-client';
import { clearSearch, openSearchInSidebar, requestSearch, receiveSearchResults } from '../../search/actions';
import * as searchSelectors from '../../search/selectors';
import * as selectors from '../../selectors';
import { CloseToCAndMobileMenuButton } from '../SidebarControl';
import { PlainButton } from './styled';

describe('toolbar', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  it('resizes on scroll', () => {
    const sidebar = assertWindow().document.createElement('div');
    jest.spyOn(selectors, 'mobileMenuOpen').mockReturnValue(true);

    renderer.create(<TestContainer store={store}>
      <Toolbar />
    </TestContainer>, { createNodeMock: () => sidebar });

    const spy = jest.spyOn(sidebar.style, 'setProperty');

    const event = assertWindow().document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);

    renderer.act(() => {
      assertWindow().dispatchEvent(event);
    });

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });

  it('has a button that closes mobile menu', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const sidebar = assertWindow().document.createElement('div');
    const component = renderer.create(<TestContainer store={store}>
      <Toolbar />
    </TestContainer>, { createNodeMock: () => sidebar });

    renderer.act(() => {
      component.root.findByType(CloseToCAndMobileMenuButton).findByType(PlainButton).props.onClick();
    });

    expect(dispatchSpy).toHaveBeenCalledWith(closeMobileMenu());

    renderer.act(() => {
      // exercise teardown of useEffect
      store.dispatch(openToc());
    });
    expect(selectors.tocOpen(store.getState())).toEqual(true);
  });

  describe('print button', () => {
    let print: jest.SpyInstance;

    beforeEach(() => {
      print = jest.spyOn(assertWindow(), 'print');
      print.mockImplementation(noop);
    });

    it('prints', () => {
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const event = {
        preventDefault: jest.fn(),
      };

      component.root.findByProps({ 'data-testid': 'print' }).props.onClick(event);

      expect(print).toHaveBeenCalled();
    });

    it('does not render print button if practice questions fleature flag is enabled', () => {
      store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      expect(() => component.root.findByProps({ 'data-testid': 'print' })).toThrow();
    });
  });

  describe('search button', () => {
    beforeAll(() => {
      const mockSearchResults = { hits: { hits: [] } } as any as SearchResult;

      jest.spyOn(searchSelectors, 'searchInSidebar').mockReturnValue(true);
      store.dispatch(receiveSearchResults(mockSearchResults));
    });

    it('opens and closes search', () => {
      const dispatch = jest.spyOn(store, 'dispatch');
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const searchButton = component.root.findByProps({ 'data-testid': 'desktop-search-button' });

      renderer.act(() => {
        searchButton.props.onClick();
      });

      expect(dispatch).toHaveBeenCalledWith(openSearchInSidebar());

      renderer.act(() => {
        store.dispatch(requestSearch('asdf'));
      });

      expect(searchButton.props.isOpen).toBe(true);
      dispatch.mockReset();

      renderer.act(() => {
        searchButton.props.onClick();
      });
      expect(dispatch).toHaveBeenCalledWith(clearSearch());
    });

    it('does not render search button if disabled', () => {
      jest.spyOn(searchSelectors, 'searchInSidebar').mockReturnValue(false);

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Toolbar />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      expect(() => component.root.findByProps({ 'data-testid': 'desktop-search-button' })).toThrow();
    });
  });
});
