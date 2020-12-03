import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import { linkColor } from '../../../components/Typography';

// tslint:disable-next-line: variable-name
const PQButton = styled(Button)`
  ${(props: { disabled: boolean }) => props.disabled && `
    background-color: #f1f1f1;
    color: #c1c1c1;
    cursor: not-allowed;
    &:hover {
      background-color: #f1f1f1;
    }
  `}
  ${(props: { withoutBg?: boolean }) => props.withoutBg && `
    border: none;
    background-color: transparent;
    color: ${linkColor};
    font-weight: normal;
  `}
`;

export default PQButton;
