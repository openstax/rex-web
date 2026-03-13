import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import ScrollLock from '../../components/ScrollLock';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import * as contentSelectors from '../selectors';
import { contentWrapperMaxWidth, verticalNavbarMaxWidth } from './constants';
import './Wrapper.css';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  verticalNavOpen?: boolean;
  className?: string;
}

const ContentLayoutBody = ({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const maxWidth = contentWrapperMaxWidth + verticalNavbarMaxWidth * 2;

  return (
    <div
      {...props}
      className={className}
      style={{
        '--content-max-width': `${maxWidth}rem`,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Export named component for testing
export const Wrapper = ({
  verticalNavOpen,
  children,
  className,
  ...props
}: React.PropsWithChildren<WrapperProps>) => (
  <ContentLayoutBody {...props} className={classNames('content-wrapper', className)}>
    {verticalNavOpen && <ScrollLock overlay={false} mediumScreensOnly={true} />}
    <div className="content-layout-body">{children}</div>
  </ContentLayoutBody>
);

// Default export with Redux hooks
const WrapperConnected = ({
  children,
  className,
  ...props
}: React.PropsWithChildren<Omit<WrapperProps, 'verticalNavOpen'>>) => {
  const verticalNavOpen = useSelector((state: AppState) =>
    contentSelectors.mobileMenuOpen(state) || selectSearch.searchResultsOpen(state)
  );

  return (
    <Wrapper
      {...props}
      verticalNavOpen={verticalNavOpen}
      className={className}
    >
      {children}
    </Wrapper>
  );
};

export default WrapperConnected;
