import styled, { css } from 'styled-components';
import theme from '../theme';

export const contentFont = 'Helvetica Neue';
export const textStyle = css`
  font-family: ${contentFont};
  color: ${theme.color.text.default};
`;

export const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;
  border-bottom: ${linkColor} solid 0.02em;

  :hover {
    color: ${linkHover};
  }
`;
export const decoratedLinkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;

  :hover {
    text-decoration: underline;
    color: ${linkHover};
  }
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

const headingStyle = (fontSize: string, lineHeight: string, topPadding: string) => css`
  ${textStyle}
  font-size: ${fontSize};
  line-height: ${lineHeight};
  letter-spacing: -0.04rem;
  padding: ${topPadding} 0 1rem 0;
  margin: 0;
`;

export const H1 = styled.h1`
  ${headingStyle('4.8rem', '5rem', '0')}
`;

export const H2 = styled.h2`
  ${headingStyle('3.6rem', '4rem', '2rem')}
`;

export const h3MobileFontSize = 1.6;
export const h3MobileLineHeight = 2;
export const h3Style = css`
  ${headingStyle('2.4rem', '3rem', '1.5rem')}
  ${theme.breakpoints.mobile(css`
    font-size: ${h3MobileFontSize}rem;
    line-height: ${h3MobileLineHeight}rem;
  `)}
`;

export const H3 = styled.h3`
  ${h3Style}
`;

export const h4MobileFontSize = 1.6;
export const h4MobileLineHeight = 2;
export const h4Style = css`
  ${headingStyle('1.8rem', '2.5rem', '1rem')}
  ${theme.breakpoints.mobile(css`
    font-size: ${h4MobileFontSize}rem;
    line-height: ${h4MobileLineHeight}rem;
  `)}
`;
