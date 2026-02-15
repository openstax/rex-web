import styled, { AnyStyledComponent,  css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

export const ShowMyHighlightsBody = styled(PopupBody as AnyStyledComponent)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}

  @media print {
    background: white;
  }
`;
