import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
export { wrapperPadding } from '../../components/Layout';

// tslint:disable-next-line:variable-name
export const Wrapper = styled(LayoutBody)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  flex: 1;
  ${theme.breakpoints.mobile(css`
    ${(props: { mobileOpen: boolean; }) => props.mobileOpen && css` display: none;`}
  `)};
`;

export default connect(
  (state: AppState) => ({
    mobileOpen: selectSearch.mobileOpen(state),
  })
)(Wrapper);
