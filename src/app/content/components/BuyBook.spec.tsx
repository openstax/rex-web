import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import BuyBook from './BuyBook';

describe('BuyBook', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders', () => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('returns null', () => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
