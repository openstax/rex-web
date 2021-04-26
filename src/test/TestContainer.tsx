import React from 'react';
import { Provider } from 'react-redux';
import * as Services from '../app/context/Services';
import MessageProvider from '../app/MessageProvider';
import { Store } from '../app/types';
import createTestServices from './createTestServices';

// tslint:disable-next-line:variable-name
const TestContainer: React.FC<{services: ReturnType<typeof createTestServices>, store: Store}> = (props) => (
  <Provider store={props.store}>
    <Services.Provider value= { props.services }>
      <MessageProvider>
        { props.children }
      </MessageProvider>
    </Services.Provider>
  </Provider>
);

export default TestContainer;
