import styled from 'styled-components';
import theme from '../../theme';

export const contentWrapperMaxWidth = 117;

export default styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  min-height: 100%;
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
  max-width: ${contentWrapperMaxWidth}rem;
  background-color: ${theme.color.neutral.base};
`;
