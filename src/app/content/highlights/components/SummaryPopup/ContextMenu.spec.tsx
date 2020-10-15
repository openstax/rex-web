import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import ColorPicker from '../ColorPicker';
import MenuToggle from '../MenuToggle';
import ContextMenu from './ContextMenu';

describe('ContextMenu', () => {
  let store: Store;
  const highlight = {
    color: HighlightColorEnum.Blue,
    id: 'hlid',
  } as Highlight;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot when closed', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ContextMenu
          highlight={highlight}
          linkToHighlight='/link/to/highlight'
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
          linkToHighlight='/link/to/highlight'
          // tslint:disable-next-line: no-empty
          onEdit={() => {}}
          // tslint:disable-next-line: no-empty
          onDelete={() => {}}
          // tslint:disable-next-line: no-empty
          onColorChange={() => {}}
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
          linkToHighlight='/link/to/highlight'
          onEdit={() => { editClicked = true; }}
          onDelete={() => { deleteClicked = true; }}
          // tslint:disable-next-line: no-empty
          onColorChange={() => {}}
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
          linkToHighlight='/link/to/highlight'
          // tslint:disable-next-line: no-empty
          onEdit={() => {}}
          // tslint:disable-next-line: no-empty
          onDelete={() => {}}
          // tslint:disable-next-line: no-empty
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
});
