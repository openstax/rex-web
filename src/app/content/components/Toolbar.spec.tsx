import noop from 'lodash/fp/noop';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { assertWindow } from '../../utils';
import Toolbar from './Toolbar';

describe('print button', () => {
  let store: Store;
  let print: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);
  });

  it('prints', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Toolbar />
      </MessageProvider>
    </Provider>);

    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByProps({'data-testid': 'print'}).props.onClick(event);

    expect(print).toHaveBeenCalled();
  });
});
