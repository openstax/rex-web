import React, { SFC } from 'react';
import Notifications from '../notifications/components/Notifications';
import NavBar from './NavBar';
import SkipToContentWrapper from './SkipToContentWrapper';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <NavBar />
  <Notifications />
  {children}
</SkipToContentWrapper>;

export default Layout;
