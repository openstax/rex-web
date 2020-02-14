import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { printSummaryHighlights, receiveSummaryHighlights } from '../../actions';
import HighlightsPrintButton from './HighlightsPrintButton';

describe('HighlightsPrintButton', () => {
  let store: Store;
  let storeDispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    storeDispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPrintButton />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('dispatches action to print highlights', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPrintButton />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      store.dispatch(receiveSummaryHighlights({}, {} as any));
    });

    const renderedPrintButton = component.root.findByProps({'data-testid': 'hl-print-button'});

    renderer.act(() => {
      renderedPrintButton.props.onClick();
    });

    expect(storeDispatch).toHaveBeenCalledWith(printSummaryHighlights({shouldFetchMore: true}));
  });
});
