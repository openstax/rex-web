import { css } from 'styled-components/macro';
import increaseFontSize from '../../utils/increaseSize';
import { textStyle } from './base';

export * from './base';
export * from './headings';

export const disabledStyle = css`
  ${textStyle}
  cursor: not-allowed;
  opacity: 0.4;
`;

export const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: underline;

  :hover {
    color: ${linkHover};
  }
`;
export const decoratedLinkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;

  :hover,
  :focus {
    text-decoration: underline;
    color: ${linkHover};
  }

  ${(props: {disabled?: boolean}) => props.disabled && css`
    &,
    :hover,
    :focus {
      ${disabledStyle}
    }
  `}
`;

export const textRegularLineHeight = 2.5;
export const textRegularSize = css`
  font-size: 1.6rem;
  line-height: ${textRegularLineHeight}rem;
`;

export const textRegularStyle = css`
  ${textStyle}
  ${textRegularSize}
`;

export const bodyCopyRegularStyle = css`
  ${textRegularStyle}

  a {
    ${linkStyle}
  }
`;

export const labelStyle = css`
  ${textStyle}
  font-size: ${increaseFontSize(1.4)}rem;
  line-height: ${increaseFontSize(1.6)}rem;
  font-weight: normal;
`;
