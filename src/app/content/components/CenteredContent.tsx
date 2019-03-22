import styled, { css } from 'styled-components';

export const contentWrapperMaxWidth = 117;

export const centeredContentStyle = css`
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
`;
export default styled.div`
  ${centeredContentStyle}
`;
