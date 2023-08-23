import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

// tslint:disable-next-line:variable-name
export const ShowMyHighlightsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;
  }
`;
