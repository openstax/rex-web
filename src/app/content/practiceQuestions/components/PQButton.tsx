import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import { linkColor, textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';

const sharedStyles = css`
  background-color: ${theme.color.primary.orange.base};
  color: ${theme.color.text.white};
  ${textRegularSize}
  font-weight: bold;
  height: 5rem;
  padding: 0 3rem;
`;

// tslint:disable-next-line: variable-name
const PQButton = styled(PlainButton)`
  ${sharedStyles}
`;

// tslint:disable-next-line: variable-name
export const PQInput = styled.input`
  ${sharedStyles}
  border: none;
  cursor: pointer;
  ${(props: { disabled: boolean }) => props.disabled && `
    background-color: #f1f1f1;
    color: #c1c1c1;
    cursor: not-allowed;
  `}
  ${(props: { withoutBg?: boolean }) => props.withoutBg && `
    background-color: transparent;
    color: ${linkColor};
    font-weight: normal;
  `}
`;

export default PQButton;
