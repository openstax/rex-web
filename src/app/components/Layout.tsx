import React, { SFC } from 'react';
import Notifications from '../notifications/components/Notifications';
import SkipToContentWrapper from './SkipToContentWrapper';
import NavBar from './NavBar';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <NavBar />
  <Notifications />
  {children}
</SkipToContentWrapper>;

export default Layout;
