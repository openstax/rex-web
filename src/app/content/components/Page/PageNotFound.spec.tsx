import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import PageNotFound, { ToCButton } from './PageNotFound';

describe('PageNotFound', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('renders correctly', () => {
    const { root } = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PageNotFound />
        </MessageProvider>
      </Services.Provider>
    </Provider>);
    expect(root.findByProps({ id: 'i18n:page-not-found:heading' })).toBeTruthy();
    expect(root.findByProps({ id: 'i18n:page-not-found:text-before-button' })).toBeTruthy();
    expect(root.findByType(ToCButton)).toBeTruthy();
  });
});
