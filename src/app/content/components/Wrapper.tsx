import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
export { wrapperPadding } from '../../components/Layout';

interface WrapperProps { searchResultsOpen: boolean; }

// tslint:disable-next-line:variable-name
export const Wrapper = styled(LayoutBody)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */

  @media screen {
    flex: 1;
  }

  ${(props: WrapperProps) => props.searchResultsOpen && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

export default connect(
  (state: AppState) => ({
    searchResultsOpen: selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
