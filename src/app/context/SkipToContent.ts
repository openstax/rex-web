import React, { RefObject } from 'react';

export const MAIN_CONTENT_ID = 'main-content';

const {Consumer, Provider} = React.createContext({
  registerMainContent: (_mainContent: RefObject<any>): void => {
    throw new Error('BUG: MainContent must be inside SkipToContentWrapper');
  },
});

export {
  Consumer,
  Provider,
};
