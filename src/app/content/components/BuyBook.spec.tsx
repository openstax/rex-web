import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { Book } from '../types';
import BuyBook from './BuyBook';

describe('BuyBook', () => {
  let store: Store;
  const bookWithLink = {
    amazon_link: 'https://amazon.com/some-book?utm_source=openstax&utm_medium=website&utm_campaign=book-page',
  } as Book;
  const bookWithoutLink = {
    amazon_link: '',
  } as Book;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders when book has amazon_link', () => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook book={bookWithLink } />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('returns null when book lacks amazon_link', () => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook book={bookWithoutLink} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
