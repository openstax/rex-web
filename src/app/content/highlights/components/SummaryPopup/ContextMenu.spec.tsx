import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../../test/TestContainer';
import { runHooksAsync } from '../../../../../test/utils';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import ColorPicker from '../ColorPicker';
import MenuToggle from '../MenuToggle';
import ContextMenu from './ContextMenu';

const book = formatBookData(archiveBook, mockCmsBook);

describe('ContextMenu', () => {
  const highlight = {
    color: HighlightColorEnum.Blue,
    id: 'hlid',
  } as Highlight;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('match snapshot when closed', async() => {
    const component = renderer.create(<TestContainer store={store}>
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
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('match snapshot when open', async() => {
    const component = renderer.create(<TestContainer store={store}>
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
    </TestContainer>);

    await runHooksAsync();

    renderer.act(() => {
      const openButton = component.root.findByType(MenuToggle);
      openButton.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onEdit, onDelete and onColorChange props', async() => {
    let editClicked = false;
    let deleteClicked = false;

    const component = renderer.create(<TestContainer store={store}>
      <ContextMenu
        highlight={highlight}
        linkToHighlight='/link/to/highlight'
        onEdit={() => { editClicked = true; }}
        onDelete={() => { deleteClicked = true; }}
        // tslint:disable-next-line: no-empty
        onColorChange={() => {}}
      />
    </TestContainer>);

    await runHooksAsync();

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

  it('properly fire onColorChange props', async() => {
    let color = HighlightColorEnum.Blue;

    const component = renderer.create(<TestContainer store={store}>
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
    </TestContainer>);

    await runHooksAsync();

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
