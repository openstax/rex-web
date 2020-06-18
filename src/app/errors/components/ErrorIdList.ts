import styled from 'styled-components/macro';
import { labelStyle } from '../../components/Typography';
import theme from '../../theme';

// tslint:disable-next-line:variable-name
export default styled.div`
  ${labelStyle}
  font-size: 0.9rem;
  color: ${theme.color.primary.gray.darker};
  opacity: 0.6;
`;
