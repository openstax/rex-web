import styled from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import theme from '../../../theme';

// tslint:disable-next-line: variable-name
const PQButton = styled(PlainButton)`
  background-color: ${theme.color.primary.orange.base};
  color: ${theme.color.text.white};
  font-size: 1.6rem;
  font-weight: bold;
  height: 5rem;
  padding: 0 3rem;
`;

export default PQButton;
