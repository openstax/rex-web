import React, { SFC } from 'react';
import styled from 'styled-components';
import { Consumer, MAIN_CONTENT_ID } from '../context/SkipToContent';

// tslint:disable-next-line:variable-name
const MainContentDispaly = styled.div`
  outline: none;
`;

// tslint:disable-next-line:variable-name
const MainContent: SFC<{className?: string}> = ({className, children}) => <Consumer>
  {({registerMainContent}) => <MainContentDispaly
    className={className}
    id={MAIN_CONTENT_ID}
    ref={registerMainContent}
    tabIndex={-1}
  >
    {children}
  </MainContentDispaly>}
</Consumer>;

export default MainContent;
