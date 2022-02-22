import React, { SFC } from 'react';
import styled, { css } from 'styled-components/macro';
import ErrorBoundary from '../errors/components/ErrorBoundary';
import ErrorModal from '../errors/components/ErrorModal';
import theme from '../theme';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import NavBar from './NavBar';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({ children }) => <AccessibilityButtonsWrapper>
  <NavBar />
  <ErrorModal />
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</AccessibilityButtonsWrapper>;

export const wrapperPadding = css`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LayoutBody = styled.div`
  width: 100%;
  ${wrapperPadding}
`;

// tslint:disable-next-line:variable-name
export const ContentLayoutBody = styled.div`
  max-width: 148rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 8rem auto auto;
  ${theme.breakpoints.mobileMedium(css`
    grid-template-columns: 100%;
  `)}
`;

export default Layout;
