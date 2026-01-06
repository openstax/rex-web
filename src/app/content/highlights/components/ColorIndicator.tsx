import React from 'react';
import styled, { css } from 'styled-components/macro';
import { Check } from 'styled-icons/fa-solid/Check';
import { isDefined } from '../../../guards';
import { highlightStyles } from '../../constants';
import { defaultFocusOutline } from '../../../theme';
import { useIntl } from 'react-intl';
import trashIcon from '../../../../assets/trash-347.svg';

interface StyleProps {
  style: typeof highlightStyles[number];
  size?: 'small';
  shape?: 'square' | 'circle';
}

interface Props<T extends React.ComponentType | undefined = React.ComponentType> extends StyleProps {
  className?: string;
  checked?: boolean;
  component?: T extends undefined ? undefined :
    T extends React.ComponentType ? React.ReactComponentElement<T>:
    never;
}

const CheckIcon = styled(Check)`
  display: none;
`;

const FocusedStyle = styled.span`
  display: none;
  position: absolute;
  height: ${(props: StyleProps) => indicatorSize(props) + 0.4}rem;
  width: ${(props: StyleProps) => indicatorSize(props) + 0.4}rem;
  background-color: transparent;
  z-index: -1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  ${(props: StyleProps) => (props.shape === 'circle' || props.shape === undefined) && css`
    border-radius: 50%;
  `}
`;

const ColorRing = styled.span`
  height: ${(props: StyleProps) => indicatorSize(props) - 0.2}rem;
  width: ${(props: StyleProps) => indicatorSize(props) - 0.2}rem;
  background-color: transparent;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  ${(props: StyleProps) => (props.shape === 'circle' || props.shape === undefined) && css`
    border-radius: 50%;
  `}
  border: 1px solid ${(props: {style: typeof highlightStyles[number]}) => props.style.focused};
`;

function Hoc<T extends React.ComponentType | undefined>(props: React.PropsWithChildren<Props<T>>) {
  const {children, style, checked, size, component, ...otherProps} = props;
  const focusedProps: StyleProps = { style, size, shape: props.shape };

  if (isDefined(component)) {
    return React.cloneElement(
      component,
      props,
      <CheckIcon key='check' />,
      children,
      <FocusedStyle {...focusedProps} />,
      <ColorRing {...focusedProps} />
    );
  }
  return <div {...otherProps}>
    <CheckIcon />
    {children}
    <FocusedStyle {...focusedProps} />
    <ColorRing {...focusedProps} />
  </div>;
}

const indicatorSize = (props: {size?: 'small'}) => props.size === 'small' ? 1.6 : 2.4;
const checkSize = (props: {size?: 'small'}) => props.size === 'small' ? 1 : 1.6;

const ColorIndicator = styled(Hoc)`
  position: relative;
  background-color: ${(props: {style: typeof highlightStyles[number]}) => props.style.passive};
  border: 1px solid ${(props: {style: typeof highlightStyles[number]}) => props.style.focusBorder};
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
      stroke: ${props.style.focusBorder};
      stroke-width: 5%;
      display: block;
    `}
  }

  input:focus + ${FocusedStyle} {
    display: block;
    ${defaultFocusOutline}
    z-index: 1;
  }
`;

function TB({
  onClick,
  className,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className: string;
}) {
  return (
    <button
      type='button'
      className={className}
      aria-label={useIntl().formatMessage({id: 'i18n:a11y:keyboard-shortcuts:deselect-highlight-color'})}
      onClick={onClick}
    >
      <img src={trashIcon} alt='' />
    </button>
  );
}

export const TrashButton = styled(TB)`
  img {
    height: ${(props: Props) => indicatorSize(props) - 0.5}rem;
    width: ${(props: Props) => indicatorSize(props) - 0.5}rem;
  }
`;

export default ColorIndicator;
