import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { Store } from '../../../types';
import Card from './Card';
import CardWrapper from './CardWrapper';

jest.mock('./Card', () => () => null);
jest.mock('./cardUtils', () => ({
  getHighlightTopOffset: () => 0,
}));

describe('CardWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', async() => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper
        highlights={[createMockHighlight()]}
      />
    </Provider>);

    // wait for React.useEffect
    await renderer.act(async() => undefined);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders cards', async() => {
    const component = renderer.create(<Provider store={store}>
      <CardWrapper
        highlights={[createMockHighlight(), createMockHighlight()]}
      />
    </Provider>);

    // wait for React.useEffect
    await renderer.act(async() => undefined);

    expect(component.root.findAllByType(Card).length).toBe(2);
  });
});
