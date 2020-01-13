import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import ColorPicker from './ColorPicker';
import HighlightToggleEdit from './HighlightToggleEdit';

describe('HighlightToggleEdit', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightToggleEdit
          color={HighlightColorEnum.Blue}
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

  it('properly fire onEdit, onDelete and onColorChange props', () => {
    let editClicked = false;
    let deleteClicked = false;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightToggleEdit
          color={HighlightColorEnum.Blue}
          onEdit={() => { editClicked = true; }}
          onDelete={() => { deleteClicked = true; }}
          // tslint:disable-next-line: no-empty
          onColorChange={() => {}}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const editButton = component.root.findByProps({ 'data-testid': 'edit' });
      editButton.props.onClick();
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
    });

    expect(editClicked).toEqual(true);
    expect(deleteClicked).toEqual(true);
  });

  it('properly fire onDelete and onColorChange props', () => {
    let deleteClicked = false;
    let color = HighlightColorEnum.Blue;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightToggleEdit
          color={color}
          // tslint:disable-next-line: no-empty
          onEdit={() => {}}
          onDelete={() => { deleteClicked = true; }}
          // tslint:disable-next-line: no-empty
          onColorChange={(newColor) => { color = newColor as HighlightColorEnum; }}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const colorPicker = component.root.findByType(ColorPicker);
      colorPicker.props.onChange('yellow');
      colorPicker.props.onRemove();
    });

    expect(deleteClicked).toEqual(true);
    expect(color).toEqual('yellow');
  });
});
