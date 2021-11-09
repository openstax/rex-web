import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import ScrollLock from '../../components/ScrollLock';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import * as contentSelectors from '../selectors';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  hasQuery: boolean;
  searchResultsOpen: boolean;
  mobileMenuOpen: boolean;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const Wrapper = styled(
  ({hasQuery, searchResultsOpen, mobileMenuOpen, children, ...props}: React.PropsWithChildren<WrapperProps>) =>
    <LayoutBody {...props}>
      {(searchResultsOpen || mobileMenuOpen) && <ScrollLock overlay={false} mobileOnly={true} />}
      {children}
    </LayoutBody>
)`
  grid-area: content;
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */

  @media screen {
    ${theme.breakpoints.mobile(css`
      margin-left: 0;
    `)}
  }
`;

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    mobileMenuOpen: contentSelectors.mobileMenuOpen(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
