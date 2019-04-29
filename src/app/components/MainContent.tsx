import React, { SFC } from 'react';
import { Consumer, MAIN_CONTENT_ID } from '../context/SkipToContent';

// tslint:disable-next-line:variable-name
const MainContent: SFC<{className?: string, isGenericStyle: boolean}> =
  ({className, isGenericStyle, children}) => <Consumer>
    {({registerMainContent}) => <div
      data-is-generic-style={isGenericStyle}
      className={className}
      id={MAIN_CONTENT_ID}
      ref={registerMainContent}
      tabIndex={-1}
    >
      {children}
    </div>}
  </Consumer>;

export default MainContent;
