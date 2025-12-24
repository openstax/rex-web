import styled, { css } from 'styled-components/macro';
import { textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';
import PrintButton from '../../components/Toolbar/PrintButton';
import { filters } from '../../styles/PopupConstants';
import { PrintOptions } from '../Toolbar/styled';

export default styled(PrintButton)`
  flex-direction: row;
  cursor: ${({loading}) => loading ? 'wait' : 'pointer'};
  height: max-content;
  min-height: unset;
  margin:  0 0 0 auto;
  padding-right: ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding-right: ${filters.dropdownToggle.sides.mobile}rem;
  `)}

  ${PrintOptions} {
    ${textRegularSize}
    margin: 0px 0px 0px 0.5rem;
    ${theme.breakpoints.mobile(css`
      display: none;
    `)}
  }
`;
