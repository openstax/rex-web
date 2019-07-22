import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
export { wrapperPadding } from '../../components/Layout';

// tslint:disable-next-line:variable-name
export const Wrapper = styled(LayoutBody)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  flex: 1;
  ${(props) => {
    if (props.open) {
      return css` display: none;`;
    }
  }}
`;

export default connect(
  (state: AppState) => ({
    open: selectSearch.open(state),
  })
)(Wrapper);
