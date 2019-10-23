import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { receiveHighlights } from '../actions';
import Card from './Card';

jest.mock('./ColorPicker', () => () => <div mock-color-picker />);
jest.mock('./Note', () => () => <div mock-note />);

describe('Card', () => {
  let store: Store;
  const highlight = createMockHighlight();

  highlight.elements = [assertDocument().createElement('span')];

  beforeEach(() => {
    store = createTestStore();

    store.dispatch(receiveHighlights([
      highlight.serialize().data,
    ]));
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
