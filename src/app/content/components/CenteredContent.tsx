import styled from 'styled-components';

export const contentWrapperMaxWidth = 117;

export default styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
`;
