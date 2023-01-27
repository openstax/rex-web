import React from 'react';
import renderer from 'react-test-renderer';
import SearchResultsSidebar from '.';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { makeEvent, makeFindByTestId, makeInputEvent } from '../../../../../test/reactutils';
import { makeSearchResults } from '../../../../../test/searchResults';
import TestContainer from '../../../../../test/TestContainer';
import { receiveExperiments } from '../../../../featureFlags/actions';
import { MiddlewareAPI, Store } from '../../../../types';
import { assertDocument } from '../../../../utils';
import { receiveBook } from '../../../actions';
import * as searchActions from '../../../search/actions';
import {
  receiveSearchResults,
  requestSearch
} from '../../../search/actions';
import * as searchSelectors from '../../../search/selectors';
import { mockBook } from '../../../utils/seoUtils.spec.data';
import { StyledSearchCloseButtonNew } from './SidebarSearchInput';

describe('search', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    store.dispatch(receiveBook(mockBook));
    store.dispatch(receiveExperiments(['tpdEbFiARyarMQ-cx46QiQ', '1']));
    store.dispatch(searchActions.openSearchResultsMobile());
  });

  const render = () => renderer.create(
    <TestContainer store={store} services={services}>
      <SearchResultsSidebar />
    </TestContainer>
  );

  it('doesn\'t render if experiment points to original', () => {
    const component = render();
    renderer.act(() => {
      store.dispatch(receiveExperiments(['tpdEbFiARyarMQ-cx46QiQ', '0']));
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
      store.dispatch(searchActions.openSearchResultsMobile());
    });

    const findById = makeFindByTestId(component.root);
    expect(() => findById('sidebar-search')).toThrowError();
  });

  it('doesn\'t dispatch search for empty string', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);
    const inputEvent = makeInputEvent('');
    renderer.act(() => {
      findById('sidebar-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => {
      findById('sidebar-search').props.onSubmit(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();

    expect(dispatch).not.toHaveBeenCalledWith(requestSearch('cool search'));
  });

  it('loads search query into text input', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);
    expect(findById('sidebar-search-input').props.value).toEqual('');

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });

    expect(findById('sidebar-search-input').props.value).toEqual('cool search');
  });

  it('tries to blur the focused element on submit', () => {
    const component = render();
    const document = assertDocument();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('sidebar-search-input').props.onChange(inputEvent);
    });

    const htmlelement = document.createElement('div');
    Object.defineProperty(document, 'activeElement', {value: htmlelement, writable: true});
    const blur1 = jest.spyOn(htmlelement, 'blur');
    renderer.act(() => findById('sidebar-search').props.onSubmit(makeEvent()));
    expect(blur1).toHaveBeenCalled();
  });

  it('search and clear work on sidebar', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    findById('sidebar-search-input').props.onChange(inputEvent);

    const event = makeEvent();
    renderer.act(() => findById('sidebar-search').props.onSubmit(event));
    expect(event.preventDefault).toHaveBeenCalled();

    renderer.act(() => {
      expect(dispatch).toHaveBeenCalledWith(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });

    expect(findById('sidebar-search-input').props.value).toEqual('cool search');

    const clearClick = makeEvent();

    renderer.act(() => {
      findById('sidebar-clear-search').props.onClick(clearClick);
    });
    expect(clearClick.preventDefault).toHaveBeenCalled();

    expect(findById('sidebar-search-input').props.value).toEqual('');
  });

  it('new search buttons use new close button', () => {
    jest.spyOn(searchSelectors, 'searchButtonColor').mockReturnValue('green');

    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    findById('sidebar-search-input').props.onChange(inputEvent);

    const event = makeEvent();
    renderer.act(() => {
      findById('sidebar-search').props.onSubmit(event);
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });

    const [closeButton] = component.root.findAllByType(StyledSearchCloseButtonNew);

    expect(closeButton).toBeTruthy();
  });
});
