import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import MessageProvider from '../MessageProvider';
import { Store } from '../types';
import OnScroll from './OnScroll';

describe('On scroll', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('doesn\'t throw when it has no children', async() => {
    const render = () => { renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <OnScroll />
        </MessageProvider>
      </Provider>);
    };

    expect(() => render()).not.toThrow();
  });
});
