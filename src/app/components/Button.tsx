import React from 'react';
import styled, { css } from 'styled-components/macro';
import { isDefined } from '../guards';
import theme, { ColorSet } from '../theme';
import { decoratedLinkStyle, linkColor, linkStyle } from './Typography';
import { textStyle } from './Typography/base';

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

type Variant = 'primary' | 'secondary' | 'default';
type Size = 'large' | 'medium' | 'small';

type ComponentType = keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>;

interface ButtonProps<T extends ComponentType | undefined> {
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  component?: T extends undefined ? undefined :
    T extends ComponentType ? React.ReactComponentElement<T>:
    never;
}

// tslint:disable-next-line:variable-name
function ButtonHoc<T extends ComponentType | undefined>({variant, size, component, ...props}: ButtonProps<T>) {
  if (isDefined(component)) {
    return React.cloneElement(component, props);
  }
  return <button {...props} />;
}

// tslint:disable-next-line:variable-name
const Button = styled(ButtonHoc)`
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.2rem;
  text-decoration: none;
  white-space: nowrap;
  ${(props) => props.size === 'large' && `
    font-size: 1.6rem;
    height: 5rem;
    padding: 0 3rem;
  `}
  ${(props) => (props.size === 'medium' || props.size === undefined) && `
    min-width: 12rem;
    font-size: 1.6rem;
    height: 4rem;
    padding: 0 3rem;
  `}
  ${(props) => props.size === 'small' && `
    font-size: 1.4rem;
    height: 3rem;
    padding: 0 2rem;
  `}

  ${(props) => props.variant === 'primary' && `
    ${applyColor(theme.color.primary.orange)}
    font-weight: bold;
    border: none;
  `}
  ${(props) => props.variant === 'secondary' && `
    ${applyColor(theme.color.secondary.lightGray)}
    font-weight: bold;
    border: none;
  `}
  ${(props) => props.variant === 'transparent' && `
    border: none;
    background-color: transparent;
    color: ${linkColor};
    font-weight: normal;
  `}
  ${(props) => (props.variant === 'default' || props.variant === undefined) && `
    ${applyColor({
      ...theme.color.neutral,
      foreground: theme.color.primary.gray.base,
    })}
    border: 1px solid #d5d5d5;
    font-weight: regular;
  `}
  ${(props) => props.disabled && `
    ${applyColor(theme.color.secondary.disabled)}
    cursor: not-allowed;
  `}
`;

// tslint:disable-next-line:variable-name
export const ButtonGroup = styled.div`
  display: grid;
  overflow: visible;
  ${(props: {expand?: boolean}) => props.expand === false && css`
    grid-auto-columns: min-content;
  `}
  grid-auto-flow: column;
  grid-gap: 1rem;
`;

// tslint:disable-next-line:variable-name
export const PlainButton = styled.button`
  cursor: pointer;
  border: none;
  margin: 0;
  padding: 0;
  background: none;
`;

// tslint:disable-next-line:variable-name
export const ButtonLink = styled(PlainButton)`
  outline: none;
  ${textStyle}
  ${(props: {decorated: boolean}) => props.decorated ? decoratedLinkStyle : linkStyle}
`;

export default Button;
