import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../theme';
import { AppState } from '../../types';
import { State } from '../types';
import { contentWrapperMaxWidth } from './constants';
import { searchResultsOpen } from '../search/selectors';
import * as searchSelectors from '../search/selectors';
import { mobileMenuOpen, tocOpen } from '../selectors';
import { styleWhenSidebarClosed } from './utils/sidebar';

const collapseGridCss = css`
  grid-column: 1 / -1;
`;

const expandGridCss = css`
  grid-column: 2;
`;

// tslint:disable-next-line: variable-name
const Wrapper = styled.div<{isTocOpen: State['tocOpen'], isVerticalNavOpen: boolean, isDesktopSearchOpen: boolean;}>`
  ${collapseGridCss}
  grid-row: 1;
  justify-self: center;
  width: 100%;
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  padding-left: 0;
  max-width: ${contentWrapperMaxWidth}rem;

  ${styleWhenSidebarClosed(expandGridCss)}
  // The grid column is not needed at a desktop breakpoint
  ${props => (props.isTocOpen || props.isTocOpen === null) && theme.breakpoints.desktop(collapseGridCss)}
  // Invert the above behavior for specific breakpoint
  ${props => !props.isTocOpen && theme.breakpoints.mobileMedium(collapseGridCss)}

  @media screen {
    display: flex;
    flex-direction: row;
  }
`;

type CenteredContentRowProps = React.PropsWithChildren<{
  isTocOpen: State['tocOpen'];
  isVerticalNavOpen: State['tocOpen'];
  isDesktopSearchOpen: State['tocOpen'];
}>;

// tslint:disable-next-line: variable-name
const CenteredContentRow = ({
  children, isTocOpen, isVerticalNavOpen, isDesktopSearchOpen
}: CenteredContentRowProps) => {
  return <Wrapper
    data-testid='centered-content-row'
    isTocOpen={isTocOpen}
    isVerticalNavOpen={isVerticalNavOpen}
    isDesktopSearchOpen={isDesktopSearchOpen}
  >
    {children}
  </Wrapper>;
};

export default connect(
  (state: AppState) => ({
    isTocOpen: tocOpen(state),
    isVerticalNavOpen: mobileMenuOpen(state) || searchResultsOpen(state),
    isDesktopSearchOpen: !!searchSelectors.query(state),
  })
)(CenteredContentRow);
