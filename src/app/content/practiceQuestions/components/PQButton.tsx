import styled from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import { linkColor, textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';

interface Props {
  withoutBg?: boolean;
  disabled?: boolean;
}

// tslint:disable-next-line: variable-name
const PQButton = styled(PlainButton)`
  background-color: ${theme.color.primary.orange.base};
  color: ${theme.color.text.white};
  ${textRegularSize}
  font-weight: bold;
  height: 5rem;
  padding: 0 3rem;
  ${(props: Props) => props.withoutBg && `
    background-color: transparent;
    color: ${linkColor};
    font-weight: normal;
  `}
  ${(props: Props) => props.disabled && `
    background-color: #f1f1f1;
    color: #c1c1c1;
    cursor: not-allowed;
  `}
`;

export default PQButton;
