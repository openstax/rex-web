import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

// tslint:disable-next-line: variable-name
export const Highlights = styled.div`
  overflow: visible;

  .os-divider {
    width: 0.8rem;
  }
`;

// tslint:disable-next-line: variable-name
export const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: inherit;
  z-index: 1;
  background-color: rgba(241, 241, 241, 0.8);

  svg {
    margin-top: -5rem;
  }
`;

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
