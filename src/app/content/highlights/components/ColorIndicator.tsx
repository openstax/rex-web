import React from 'react';
import styled, { css } from 'styled-components/macro';
import { Check } from 'styled-icons/fa-solid/Check';
import { isDefined } from '../../../guards';
import { highlightStyles } from '../../constants';

interface Props<T extends React.ComponentType | undefined = React.ComponentType> {
  size?: 'small';
  shape?: 'square' | 'circle';
  className?: string;
  style: typeof highlightStyles[number];
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
function Hoc<T extends React.ComponentType | undefined>(
  {children, style, checked, size, component, ...props}: React.PropsWithChildren<Props<T>>
) {
  if (isDefined(component)) {
    return React.cloneElement(component, props, [children, <CheckIcon key='check' />]);
  }
  return <div {...props}><CheckIcon />{children}</div>;
}

const indicatorSize = (props: {size?: 'small'}) => props.size === 'small' ? 1.6 : 2.4;
const checkSize = (props: {size?: 'small'}) => props.size === 'small' ? 1 : 1.6;

// tslint:disable-next-line:variable-name
const ColorIndicator = styled(Hoc)`
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

  ${CheckIcon} {
    height: ${(props: Props) => checkSize(props)}rem;
    width: ${(props: Props) => checkSize(props)}rem;
    ${(props: {checked?: boolean, style: typeof highlightStyles[number]}) => props.checked && css`
      color: ${props.style.focused};
      display: block;
    `}
  }

  ${(props: {checked?: boolean, style: typeof highlightStyles[number]}) => props.checked !== false && css`
    input:checked + ${CheckIcon} {
      color: ${props.style.focused};
      display: block;
    }
  `}
`;

export default ColorIndicator;
