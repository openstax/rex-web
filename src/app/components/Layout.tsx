import React from 'react';
import classNames from 'classnames';
import { css } from 'styled-components/macro';
import ErrorBoundary from '../errors/components/ErrorBoundary';
import ErrorModal from '../errors/components/ErrorModal';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import NavBar from './NavBar';
import OnEsc from './OnEsc';
import PageTitleConfirmation from './PageTitleConfirmation';
import { layoutPadding } from './Layout.constants';
import theme from '../theme';
import './Layout.css';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <AccessibilityButtonsWrapper>
      <NavBar />
      <OnEsc />
      <PageTitleConfirmation />
      <ErrorModal />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AccessibilityButtonsWrapper>
  );
}

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

// Export legacy styled-components fragment for backward compatibility
export const wrapperPadding = css`
  padding: 0 ${layoutPadding.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${layoutPadding.mobile}rem;
  `)}
`;
