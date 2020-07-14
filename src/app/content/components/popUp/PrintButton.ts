import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import PrintButton from '../../components/Toolbar/PrintButton';
import { filters } from '../../styles/PopupConstants';

// tslint:disable-next-line:variable-name
export default styled(PrintButton)`
  cursor: ${({loading}) => loading ? 'wait' : 'pointer'};
  min-width: auto;
  height: max-content;
  margin-left: ${({studyGuidesButton}) => studyGuidesButton ? '0' : 'auto'};
  padding-right: ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding-right: ${filters.dropdownToggle.sides.mobile}rem;
  `)}
`;
