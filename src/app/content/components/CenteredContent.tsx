import styled from 'styled-components';
import { contentWrapperMaxWidth } from './constants';

export default styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
`;
