import React, { SFC } from 'react';
import { Consumer, MAIN_CONTENT_ID } from '../context/SkipToContent';

// tslint:disable-next-line:variable-name
const MainContent: SFC<{className?: string, dangerouslySetInnerHTML: {__html: string}}> =
  ({className, dangerouslySetInnerHTML, children}) => <Consumer>
    {({registerMainContent}) => <div
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      className={className}
      id={MAIN_CONTENT_ID}
      ref={registerMainContent}
      tabIndex={-1}
    >
      {children}
    </div>}
  </Consumer>;

export default MainContent;
