import { HTMLElement } from '@openstax/types/lib.dom';
import noop from 'lodash/fp/noop';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { resetModules } from '../../../../../test/utils';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { assertWindow } from '../../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights } from '../../actions';
import HighlightsPrintButton from './HighlightsPrintButton';

describe('HighlightsPrintButton', () => {
  let store: Store;
  let print: jest.SpyInstance;
  let ref: React.RefObject<HTMLElement>;
  beforeEach(() => {
    resetModules();
    ref = {current: null};
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);

    store = createTestStore();
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

  it('disables button if summary is loading', () => {
    store.dispatch(receiveSummaryHighlights({}, {} as any));
    store.dispatch(printSummaryHighlights({containerRef: ref}));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPrintButton />
      </MessageProvider>
    </Provider>);

    const button = component.root.findByProps({'data-testid': 'print'});
    expect(button.props.disabled).toBe(true);
  });
});
