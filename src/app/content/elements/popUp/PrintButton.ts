import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { filters } from '../../styles/PopupConstants';
import HighlightsPrintButton from '../HighlightsPrintButton';

// tslint:disable-next-line:variable-name
export default styled(HighlightsPrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
  padding-right: ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding-right: ${filters.dropdownToggle.sides.mobile}rem;
  `)}
`;
