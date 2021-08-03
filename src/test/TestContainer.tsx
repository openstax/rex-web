import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import * as Services from '../app/context/Services';
import { AppServices, MiddlewareAPI, Store } from '../app/types';
import createTestServices from './createTestServices';
import createTestStore from './createTestStore';
import MessageProvider from './MessageProvider';

interface TestContainerProps {
  services?: AppServices & MiddlewareAPI;
  store?: Store;
  children: ReactNode;
}

const testStore = createTestStore();
const testServices = createTestServices();

const servicesWithReduxMiddleware = {
  ...testServices,
  dispatch: testStore.dispatch,
  getState: testStore.getState,
};

// tslint:disable-next-line:variable-name max-line-length
const TestContainer = ({services = servicesWithReduxMiddleware, store = testStore, children}: TestContainerProps) =>
  <Provider store={store}>
    <Services.Provider value={services}>
      <MessageProvider>
        {children}
      </MessageProvider>
    </Services.Provider>
  </Provider>;

export default TestContainer;
