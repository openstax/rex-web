import React from 'react';
import { connect } from 'react-redux';
import ScrollLock from '../../components/ScrollLock';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import * as contentSelectors from '../selectors';
import { contentWrapperMaxWidth, verticalNavbarMaxWidth } from './constants';
import './Wrapper.css';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  hasQuery: boolean;
  verticalNavOpen: boolean;
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

export const Wrapper = ({
  hasQuery,
  verticalNavOpen,
  children,
  className,
  ...props
}: React.PropsWithChildren<WrapperProps>) => (
  <ContentLayoutBody {...props} className={`content-wrapper ${className || ''}`}>
    {verticalNavOpen && <ScrollLock overlay={false} mediumScreensOnly={true} />}
    <div className="content-layout-body">{children}</div>
  </ContentLayoutBody>
);

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    verticalNavOpen: contentSelectors.mobileMenuOpen(state) || selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
