import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import SearchResultsSidebar from '.';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import { makeFindOrNullByTestId, renderToDom } from '../../../../../test/reactutils';
import { makeSearchResultHit, makeSearchResults } from '../../../../../test/searchResults';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import { receiveSearchResults, requestSearch } from '../../actions';

describe('SearchResultsSidebar', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(formatBookData(archiveBook, mockCmsBook)));
  });

  const render = () => <MessageProvider>
    <Provider store={store}>
      <SearchResultsSidebar />
    </Provider>
  </MessageProvider>;

  it('mounts and unmounts without a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    expect(() => component.unmount()).not.toThrow();
  });

  it('mounts and unmmounts with a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const {root} = renderToDom(render());
    expect(() => unmountComponentAtNode(root)).not.toThrow();
  });

  it('doesn\'t render if there is no search', () => {
    const component = renderer.create(render());
    const findOrNull = makeFindOrNullByTestId(component.root);

    expect(findOrNull('search-results-sidebar')).toBe(null);
  });

  it('shows sidebar with loading state if there is a search', () => {
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    const findOrNull = makeFindOrNullByTestId(component.root);

    expect(findOrNull('search-results-sidebar')).not.toBe(null);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for no search results', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([])));

    const tree = renderer.create(render()).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with results', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([makeSearchResultHit({book: archiveBook, page})])));

    const tree = renderer.create(render()).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
