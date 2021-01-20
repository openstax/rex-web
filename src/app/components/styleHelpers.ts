import { css } from 'styled-components/macro';

export const visuallyShown = css`
  height: unset;
  width: unset;
  clip: unset;
  overflow: visible;
`;

export const visuallyHidden = css`
  height: 0;
  width: 0;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;
