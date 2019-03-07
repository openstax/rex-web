import styled, { css } from 'styled-components';

export const h3Style = css`
  font-size: 2.4rem;
  line-height: 3rem;
  letter-spacing: -0.04rem;

  @media (max-width: 48em) {
    font-size: 1.6rem;
  }  
`;

export const bodyCopyRegularStyle = css`
  font-family: Helvetica Neue;
  font-size: 1.6rem;
  line-height: 2.5rem;
`;  

export const h4Style = css`
  font-size: 1.8rem;
  line-height: 2.5rem;
  letter-spacing: -0.04rem;
  text-decoration: none;

  @media (max-width: 48em) {
    font-size: 1.6rem;
  }
`;

export const H3 = styled.h3`
  ${h3Style}
`;
  