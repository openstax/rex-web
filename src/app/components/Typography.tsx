import styled from 'styled-components';
import { css } from 'styled-components';

export const linkColor = '#027EB5';
export const linkStyle = css`
  color: ${linkColor};
  cursor: pointer;
  text-decoration: none;
  border-bottom: ${linkColor} solid 0.02em;
`;

export const contentFont = 'Helvetica Neue';
export const textStyle = css`
  font-family: ${contentFont};
  color: #424242;
`;

export const textRegularStyle = css`
  ${textStyle}
  font-size: 1.6rem;
  line-height: 2.5rem;
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

export const H3 = styled.h3`
  ${textStyle}
  font-size: 2.4rem;
  line-height: 3rem;
  letter-spacing: -0.04rem;
  padding: 1.5rem 0 1rem 0;
  margin: 0;
`;
