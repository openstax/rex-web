import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import * as Services from '../app/context/Services';
import { Store } from '../app/types';
import createTestServices from './createTestServices';
import createTestStore from './createTestStore';
import MessageProvider from './MessageProvider';

interface TestContainerProps {
  services?: ReturnType<typeof createTestServices>;
  store?: Store;
  children: ReactNode;
}

// tslint:disable-next-line:variable-name max-line-length
const TestContainer = (props: TestContainerProps) => {
  const services = props.services || createTestServices();
  const store = props.store || createTestStore();
  const reduxMiddleware = {
    dispatch: store.dispatch,
    getState: store.getState,
  };
  return <Provider store={store}>
    <Services.Provider value={{...services, ...reduxMiddleware}}>
      <MessageProvider>
        {props.children}
      </MessageProvider>
    </Services.Provider>
  </Provider>;
};

export default TestContainer;
