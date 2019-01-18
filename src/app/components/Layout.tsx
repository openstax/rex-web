import React, { SFC } from 'react';
import Notifications from '../notifications/components/Notifications';
import SkipToContentWrapper from './SkipToContentWrapper';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <Notifications />
  {children}
</SkipToContentWrapper>;

export default Layout;
