import React, { SFC } from 'react';
import NavBar from './NavBar';
import SkipToContentWrapper from './SkipToContentWrapper';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <NavBar />
  {children}
</SkipToContentWrapper>;

export default Layout;
