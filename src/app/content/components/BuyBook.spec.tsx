import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import TestContainer from '../../../test/TestContainer';
import { runHooksAsync } from '../../../test/utils';
import { Store } from '../../types';
import { receiveBuyPrintConfig } from '../actions';
import { receiveBook } from '../actions';
import { formatBookData } from '../utils';
import BuyBook from './BuyBook';

const book = formatBookData(archiveBook, mockCmsBook);

describe('BuyBook', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('renders when config is available', async() => {
    store.dispatch(receiveBuyPrintConfig({url: 'https://example.com', disclosure: 'asdf'}));
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('returns null', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
