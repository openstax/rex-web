import { css } from 'styled-components';
import theme from '../theme';

export const linkColor = '#027EB5';
export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;
  border-bottom: ${linkColor} solid 0.02em;
`;

export const textRegularStyle = css`
  font-family: Helvetica Neue;
  font-size: 1.6rem;
  line-height: 2.5rem;
  color: ${theme.color.text.default};
`;

export const bodyCopyRegularStyle = css`
  ${textRegularStyle}

  a {
    ${linkStyle}
  }
`;
