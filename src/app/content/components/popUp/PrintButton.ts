import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import PrintButton from '../../components/Toolbar/PrintButton';
import { filters } from '../../styles/PopupConstants';

// tslint:disable-next-line:variable-name
export default styled(PrintButton)<{loading: boolean}>`
  cursor: ${({loading}) => loading ? 'wait' : 'pointer'};
  height: max-content;
  margin-left: auto;
  padding-right: ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding-right: ${filters.dropdownToggle.sides.mobile}rem;
  `)}
`;
