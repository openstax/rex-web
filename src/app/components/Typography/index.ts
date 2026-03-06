import { css } from 'styled-components/macro';
import theme from '../../theme';

// Import CSS files
import './TextStyles.css';
import './Links.css';

// Export new components
export * from './Headings';
export * from './Links';

// Export constants for backward compatibility
export const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const textRegularLineHeight = 2.5;

// Export styled-components css fragments for backward compatibility
// These maintain compatibility with existing code that interpolates them in styled-components
export const textStyle = css`
  color: ${theme.color.text.default};
`;

export const textRegularSize = css`
  font-size: 1.6rem;
  line-height: ${textRegularLineHeight}rem;
`;

export const textRegularStyle = css`
  ${textStyle}
  ${textRegularSize}
`;

export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: underline;

  :hover {
    color: ${linkHover};
  }
`;

export const bodyCopyRegularStyle = css`
  ${textRegularStyle}

  a {
    ${linkStyle}
  }
`;

export const labelStyle = css`
  ${textStyle}
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: normal;
`;

export const disabledStyle = css`
  ${textStyle}
  cursor: not-allowed;
  opacity: 0.4;
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
