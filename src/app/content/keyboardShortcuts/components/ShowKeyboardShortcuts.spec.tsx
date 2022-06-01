import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../test/TestContainer';
import { Store } from '../../../types';
import { receiveBook } from '../../actions';
import ShowKeyboardShortcuts from './ShowKeyboardShortcuts';

describe('ShowKeyboardShortcuts', () => {
  let store: Store;
  let render: () => JSX.Element;

  beforeEach(() => {
    store = createTestStore();
    render = () => <TestContainer store={store}>
      <ShowKeyboardShortcuts />
    </TestContainer>;
  });

  it('renders the keyboard shortcuts menu', () => {
    store.dispatch(receiveBook(book));

    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });
});
