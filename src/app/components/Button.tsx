import styled, { css } from 'styled-components';

export default styled.button<{variant: undefined | 'primary' | 'default'}>`
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  height: 3rem;
  margin: 0;
  padding: 0 1.5rem;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  width: auto;
  font-size: 1.25rem;
  font-weight: bold;

  ${(props) => props.variant === 'primary' && css`
    background-color: #f36b32;
    color: #fff;
  `}
  ${(props) => props.variant === 'default' && css`
    background-color: #f1f1f1;
    color: #424242;
  `}
`;

// tslint:disable-next-line:variable-name
export const ButtonGroup = styled.div`
  display: grid;
  grid-gap: 1rem;
  max-width: 100%;
`;
