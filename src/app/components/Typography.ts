import styled, { css } from 'styled-components';

export const h3Style = css`
  font-size: 2.4rem;
  line-height: 3rem;
`;

export const h4Style = css`
  font-size: 1.8rem;
  line-height: 2.5rem;
`;

export const H3 = styled.h3`
  ${h3Style}
`;

export default {
  h3Style,
  h4Style,
};
  