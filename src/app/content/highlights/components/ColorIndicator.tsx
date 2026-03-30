import React from 'react';
import styled, { css } from 'styled-components/macro';
import { isDefined } from '../../../guards';
import { highlightStyles } from '../../constants';
import { defaultFocusOutline } from '../../../theme';
import { useIntl } from 'react-intl';
import trashIcon from '../../../../assets/trash-347.svg';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Check icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function CheckBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
      />
    </svg>
  );
}

const Check = styled(CheckBase)``;

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
