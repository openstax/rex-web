import React, { SFC } from 'react';
import NavBar from './NavBar';
import SkipToContentWrapper from './SkipToContentWrapper';
import { css } from 'styled-components';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <NavBar />
  {children}
</SkipToContentWrapper>;

export const disablePrint = css`@media print { display: none; }`

export default Layout;
