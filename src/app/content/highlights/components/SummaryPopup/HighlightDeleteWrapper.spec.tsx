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
import HighlightDeleteWrapper from './HighlightDeleteWrapper';

describe('HighlightDeleteWrapper', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('match snapshot', async() => {
    const component = renderer.create(<TestContainer store={store}>
      {/* tslint:disable-next-line: no-empty */}
      <HighlightDeleteWrapper onCancel={() => {}} onDelete={() => {}} />
    </TestContainer>);

    await runHooksAsync();

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onDelete props', async() => {
    let deleteClicked = false;
    let cancelClicked = false;

    const component = renderer.create(<TestContainer store={store}>
      <HighlightDeleteWrapper
        onCancel={() => { cancelClicked = true; }}
        onDelete={() => { deleteClicked = true; }}
      />
    </TestContainer>);

    await runHooksAsync();

    renderer.act(() => {
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
      const cancelButton = component.root.findByProps({ 'data-testid': 'cancel' });
      cancelButton.props.onClick();
    });

    expect(deleteClicked).toEqual(true);
    expect(cancelClicked).toEqual(true);
  });

  it('focus wrapper on render', async() => {
    const focus = jest.fn();
    const createNodeMock = () => ({ focus });

    renderer.create(<TestContainer store={store}>
      <HighlightDeleteWrapper
        onCancel={() => null}
        onDelete={() => null}
      />
    </TestContainer>, {createNodeMock});

    await runHooksAsync();

    expect(focus).toHaveBeenCalled();
  });
});
