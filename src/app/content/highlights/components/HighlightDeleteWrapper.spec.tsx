import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';

describe('HighlightDeleteWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        {/* tslint:disable-next-line: no-empty */}
        <HighlightDeleteWrapper onCancel={() => {}} onDelete={() => {}} />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onDelete props', () => {
    let deleteClicked = false;
    let cancelClicked = false;

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightDeleteWrapper
          onCancel={() => { cancelClicked = true; }}
          onDelete={() => { deleteClicked = true; }}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
      const cancelButton = component.root.findByProps({ 'data-testid': 'cancel' });
      cancelButton.props.onClick();
    });

    expect(deleteClicked).toEqual(true);
    expect(cancelClicked).toEqual(true);
  });
});
