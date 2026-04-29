import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { Store } from '../../../types';
import { SearchControlButton } from './SearchControl';
import { clearSearch, openSearchInSidebar } from '../../search/actions';
import * as searchSelectors from '../../search/selectors';

describe('SearchControlButton', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dispatches openSearchInSidebar when search is closed and button is clicked', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(false);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByProps({ 'data-testid': 'desktop-search-button' });

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatchSpy).toHaveBeenCalledWith(openSearchInSidebar());
  });

  it('dispatches clearSearch when search is open and button is clicked', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(true);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByProps({ 'data-testid': 'desktop-search-button' });

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatchSpy).toHaveBeenCalledWith(clearSearch());
  });

  it('sets aria-expanded to false when search is closed', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(false);

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    expect(button.props['aria-expanded']).toBe(false);
  });

  it('sets aria-expanded to true when search is open', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(true);

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    expect(button.props['aria-expanded']).toBe(true);
  });

  it('sets aria-label based on search state (closed)', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(false);

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    // MessageProvider provides English translations
    expect(button.props['aria-label']).toContain('Search');
  });

  it('sets aria-label based on search state (open)', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(true);

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    // MessageProvider provides English translations
    expect(button.props['aria-label']).toContain('Search');
  });

  it('sets aria-controls to search-results-sidebar', () => {
    jest.spyOn(searchSelectors, 'searchResultsOpen').mockReturnValue(false);

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchControlButton />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    expect(button.props['aria-controls']).toBe('search-results-sidebar');
  });
});
