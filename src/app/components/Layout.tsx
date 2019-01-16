import React, { SFC } from 'react';
import SkipToContentWrapper from './SkipToContentWrapper';
import Notifications from '../notifications/components/Notifications';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <Notifications />
  {children}
</SkipToContentWrapper>;

export default Layout;
