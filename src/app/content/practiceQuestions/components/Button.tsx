import styled from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import theme from '../../../theme';

interface ButtonProps {
  withoutBackground: boolean;
}

export default styled(PlainButton)`
  backgrouond-color: ${theme.color.primary.orange.base};
  color: ${theme.color.text.white};
  font-size: 1.6rem;
  font-weight: bold;
  height: 5rem;
  padding: 0 3rem;
  ${(props: ButtonProps) => {
    if (props.withoutBackground) {
      return `
        backgrouond-color: transparent;
        color: #027eb5;
      `;
    }
  }}
`;
