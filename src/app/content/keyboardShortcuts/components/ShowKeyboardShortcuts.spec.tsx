import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../test/TestContainer';
import { Card } from '../../../components/Modal/styles';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook } from '../../actions';
import { content } from '../../routes';
import ShowKeyboardShortcuts, {
  Shortcut,
  ShortcutKeyStyle,
  ShortcutsHeading,
} from './ShowKeyboardShortcuts';

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

    expect(() => component.root.findByType(ShortcutsHeading)).not.toThrow();
    expect(() => component.root.findByType(Card)).not.toThrow();
    expect(() => component.root.findByType(Shortcut)).not.toThrow();
    expect(() => component.root.findByType(ShortcutKeyStyle)).not.toThrow();
  });
});
