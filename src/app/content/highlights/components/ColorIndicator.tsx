import React from 'react';
import styled, { css } from 'styled-components/macro';
import { Check } from 'styled-icons/fa-solid/Check';
import { isDefined } from '../../../guards';
import { highlightStyles } from '../../constants';

interface FocusedStyleProps {
  style: typeof highlightStyles[number];
  size?: 'small';
  shape?: 'square' | 'circle';
}

interface Props<T extends React.ComponentType | undefined = React.ComponentType> extends FocusedStyleProps {
  className?: string;
  checked?: boolean;
  component?: T extends undefined ? undefined :
    T extends React.ComponentType ? React.ReactComponentElement<T>:
    never;
}

// tslint:disable-next-line:variable-name
const CheckIcon = styled(Check)`
  display: none;
`;

// tslint:disable-next-line:variable-name
const FocusedStyle = styled.span`
  display: none;
  position: absolute;
  height: ${(props: FocusedStyleProps) => indicatorSize(props) + 0.6}rem;
  width: ${(props: FocusedStyleProps) => indicatorSize(props) + 0.6}rem;
  background-color: ${(props: {style: typeof highlightStyles[number]}) => props.style.passive};
  z-index: -1;
  left: -0.4rem;
  top: -0.4rem;
  ${(props: FocusedStyleProps) => (props.shape === 'circle' || props.shape === undefined) && css`
    border-radius: 2rem;
  `}
`;

// tslint:disable-next-line:variable-name
function Hoc<T extends React.ComponentType | undefined>(props: React.PropsWithChildren<Props<T>>) {
  const {children, style, checked, size, component, ...otherProps} = props;
  const focusedProps: FocusedStyleProps = { style, size, shape: props.shape };

  if (isDefined(component)) {
    return React.cloneElement(
      component,
      props,
      [<CheckIcon key='check' />, children, <FocusedStyle {...focusedProps} />]
    );
  }
  return <div {...otherProps}><CheckIcon />{children}<FocusedStyle {...focusedProps} /></div>;
}

const indicatorSize = (props: {size?: 'small'}) => props.size === 'small' ? 1.6 : 2.4;
const checkSize = (props: {size?: 'small'}) => props.size === 'small' ? 1 : 1.6;

// tslint:disable-next-line:variable-name
const ColorIndicator = styled(Hoc)`
  position: relative;
  background-color: ${(props: {style: typeof highlightStyles[number]}) => props.style.passive};
  border: 1px solid ${(props: {style: typeof highlightStyles[number]}) => props.style.focused};
  height: ${(props: Props) => indicatorSize(props)}rem;
  width: ${(props: Props) => indicatorSize(props)}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props: Props) => (props.shape === 'circle' || props.shape === undefined) && css`
    border-radius: 2rem;
  `}
  overflow: visible;

  ${CheckIcon} {
    height: ${(props: Props) => checkSize(props)}rem;
    width: ${(props: Props) => checkSize(props)}rem;
    ${(props: Props) => props.checked && css`
      color: ${props.style.focused};
      display: block;
    `}
  }

  input:focus + ${FocusedStyle} {
    display: block;
  }
`;

export default ColorIndicator;
