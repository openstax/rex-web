import styled from 'styled-components';
import theme, { ColorSet } from '../theme';
import { textRegularStyle } from './Typography';

const applyColor = (color: ColorSet) => `
  color: ${color.foreground};
  background-color: ${color.base};

  :hover {
    background-color: ${color.darker};
  }
  :active {
    background-color: ${color.darkest};
  }
`;

export default styled.button<{variant: undefined | 'primary' | 'secondary' | 'default'}>`
  align-items: center;
  border: none;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  height: 5rem;
  margin: 0;
  padding: 0 2rem;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  width: auto;

  ${textRegularStyle}
  font-weight: bold;

  ${(props) => props.variant === 'primary' && applyColor(theme.color.primary.orange)}
  ${(props) => props.variant === 'secondary' && applyColor(theme.color.secondary.lightGray)}
  ${(props) => props.variant === 'default' && applyColor(theme.color.neutral)}
`;

// tslint:disable-next-line:variable-name
export const ButtonGroup = styled.div`
  display: grid;
  grid-gap: 1rem;
  max-width: 100%;
`;
