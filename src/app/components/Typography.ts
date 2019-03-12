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

export const textRegularSize = css`
  font-size: 1.6rem;
  line-height: 2.5rem;
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

export const H1 = styled.h1`
  ${textStyle}
  font-size: 4.8rem;
  line-height: 5rem;
  letter-spacing: -0.04rem;
  padding: 0 0 1rem 0;
  margin: 0;
`;

export const H2 = styled.h2`
  ${textStyle}
  font-size: 3.6rem;
  line-height: 4rem;
  letter-spacing: -0.04rem;
  padding: 2rem 0 1rem 0;
  margin: 0;
`;

export const h3Style = css`
  ${textStyle}
  font-size: 2.4rem;
  line-height: 3rem;
  letter-spacing: -0.04rem;
  padding: 1.5rem 0 1rem 0;
  margin: 0;

  @media (max-width: 48em) {
    font-size: 1.6rem;
  }
`;

export const H3 = styled.h3`
  ${h3Style}
`;

export const h4Style = css`
  ${textStyle}
  font-size: 1.8rem;
  line-height: 2.5rem;
  letter-spacing: -0.04rem;
  padding: 1rem 0 1rem 0;
  margin: 0;

  @media (max-width: 48em) {
    font-size: 1.6rem;
    line-height: 1.6rem;
  }
`;
