import React, { SFC } from 'react';
import classNames from 'classnames';
import ErrorBoundary from '../errors/components/ErrorBoundary';
import ErrorModal from '../errors/components/ErrorModal';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import NavBar from './NavBar';
import OnEsc from './OnEsc';
import PageTitleConfirmation from './PageTitleConfirmation';
import { layoutPadding } from './Layout.constants';
import './Layout.css';

const Layout: SFC = ({ children }) => <AccessibilityButtonsWrapper>
  <NavBar />
  <OnEsc />
  <PageTitleConfirmation />
  <ErrorModal />
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</AccessibilityButtonsWrapper>;

// Export legacy styled-components fragment for backward compatibility
export { wrapperPadding } from './Layout.legacy';

export const LayoutBody = ({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={classNames('layout-body', className)}
    style={{
      '--layout-padding-desktop': `${layoutPadding.desktop}rem`,
      '--layout-padding-mobile': `${layoutPadding.mobile}rem`,
      ...style,
    } as React.CSSProperties}
  >
    {children}
  </div>
);

export default Layout;
