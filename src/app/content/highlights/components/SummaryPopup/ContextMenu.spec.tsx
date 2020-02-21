import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book } from '../../../../../test/mocks/archiveLoader';
import createMockHighlightData from '../../../../../test/mocks/highlightData';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import ColorPicker from '../ColorPicker';
import MenuToggle from '../MenuToggle';
import ContextMenu from './ContextMenu';

const highlight = createMockHighlightData();

describe('ContextMenu', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot when closed', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          // tslint:disable-next-line: no-empty
          onEdit={() => {}}
          // tslint:disable-next-line: no-empty
          onDelete={() => {}}
          // tslint:disable-next-line: no-empty
          onColorChange={() => {}}
        />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('match snapshot when open', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          onEdit={() => null}
          onDelete={() => null}
          onColorChange={() => null}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const openButton = component.root.findByType(MenuToggle);
      openButton.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onEdit, onDelete and onColorChange props', () => {
    let editClicked = false;
    let deleteClicked = false;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          onEdit={() => { editClicked = true; }}
          onDelete={() => { deleteClicked = true; }}
          onColorChange={() => null}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const openButton = component.root.findByType(MenuToggle);
      openButton.props.onClick();
    });

    renderer.act(() => {
      const editButton = component.root.findByProps({ 'data-testid': 'edit' });
      editButton.props.onClick();
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
    });

    expect(editClicked).toEqual(true);
    expect(deleteClicked).toEqual(true);
  });

  it('properly fire onColorChange props', () => {
    let color = HighlightColorEnum.Blue;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          onEdit={() => null}
          onDelete={() => null}
          onColorChange={(newColor) => { color = newColor as HighlightColorEnum; }}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const openButton = component.root.findByType(MenuToggle);
      openButton.props.onClick();
    });

    renderer.act(() => {
      const colorPicker = component.root.findByType(ColorPicker);
      colorPicker.props.onChange('yellow');
    });

    expect(color).toEqual('yellow');
  });

  it('create valid link to the highlight', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));

    const expectedLink = `/books/book-slug-1/pages/test-page-1?highlight=${highlight.id}`;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          onEdit={() => null}
          onDelete={() => null}
          onColorChange={() => null}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const openButton = component.root.findByType(MenuToggle);
      openButton.props.onClick();
    });

    renderer.act(() => {
      const linkButton = component.root.findByProps({ 'data-testid': 'goto-highlight' });
      expect(linkButton.props.href).toEqual(expectedLink);
    });
  });
});
