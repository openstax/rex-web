import React, { SFC } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components/macro';
import ErrorBoundary from '../errors/components/ErrorBoundary';
import ErrorModal from '../errors/components/ErrorModal';
import theme from '../theme';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import NavBar from './NavBar';
import OnEsc from './OnEsc';
import PageTitleConfirmation from './PageTitleConfirmation';

// tslint:disable-next-line:variable-name
const MathJaxStyles = createGlobalStyle`
  mjx-help-background {
    z-index: ${theme.zIndex.navbar + 1};
  }
`;

// tslint:disable-next-line:variable-name
const Layout: SFC = ({ children }) => <AccessibilityButtonsWrapper>
  <MathJaxStyles />
  <NavBar />
  <OnEsc />
  <PageTitleConfirmation />
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

export default Layout;
