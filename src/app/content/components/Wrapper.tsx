import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import { searchResultsBarDesktopWidth, sidebarTransitionTime } from './constants';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  searchResultsOpen: boolean;
  searchMobileOpen: boolean;
}

// tslint:disable-next-line:variable-name
export const Wrapper = styled(LayoutBody)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  transition: margin-left ${sidebarTransitionTime}ms;

  @media screen {
    flex: 1;
  }

  ${(props: WrapperProps) => props.searchResultsOpen && `
    margin-left: ${searchResultsBarDesktopWidth}rem;
  `}
  ${(props: WrapperProps) => props.searchMobileOpen && theme.breakpoints.mobile(css`
    display: none;
  `)}
  ${theme.breakpoints.mobile(css`
    margin-left: 0;
  `)}
`;

export default connect(
  (state: AppState) => ({
    searchMobileOpen: selectSearch.mobileOpen(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
