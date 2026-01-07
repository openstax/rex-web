import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import ScrollLock from '../../components/ScrollLock';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import * as contentSelectors from '../selectors';
import { contentWrapperMaxWidth, verticalNavbarMaxWidth } from './constants';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  hasQuery: boolean;
  verticalNavOpen: boolean;
  className?: string;
}

export const Wrapper = styled(
  ({hasQuery, verticalNavOpen, children, ...props}: React.PropsWithChildren<WrapperProps>) =>
    <ContentLayoutBody {...props}>
      {verticalNavOpen && <ScrollLock overlay={false} mediumScreensOnly={true} />}
      {children}
    </ContentLayoutBody>
)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */

  @media screen {
    ${theme.breakpoints.mobile(css`
      margin-left: 0;
    `)}
  }
`;

const ContentLayoutBody = styled.div`
  width: 100%;
  max-width: ${contentWrapperMaxWidth + verticalNavbarMaxWidth * 2}rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 8rem auto auto;
  ${theme.breakpoints.mobileMedium(css`
    grid-template-columns: 100%;
  `)}
`;

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    verticalNavOpen: contentSelectors.mobileMenuOpen(state) || selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
