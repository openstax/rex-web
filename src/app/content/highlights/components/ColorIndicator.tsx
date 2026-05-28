import React from 'react';
import styled from 'styled-components/macro';
import { isDefined } from '../../../guards';
import { highlightStyles } from '../../constants';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import trashIcon from '../../../../assets/trash-347.svg';
// CSS is imported in src/app/index.tsx

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Check icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
function Check({ className, ...props }: IconProps) {
  return (
    <svg
      className={`color-indicator-check ${className || ''}`}
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

interface StyleProps {
  style: typeof highlightStyles[number];
  size?: 'small';
  shape?: 'square' | 'circle';
}

interface Props<T extends React.ComponentType | undefined = React.ComponentType>
extends StyleProps, Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  className?: string;
  checked?: boolean;
  component?: T extends undefined ? undefined :
    T extends React.ComponentType ? React.ReactComponentElement<T>:
    never;
}

function ColorIndicator<T extends React.ComponentType | undefined>(props: React.PropsWithChildren<Props<T>>) {
  const {children, style, checked, size, component, shape, className, ...otherProps} = props;
  const indicatorStyle = {
    '--passive-color': style.passive,
    '--focused-color': style.focused,
    '--focus-border-color': style.focusBorder,
    '--focus-outline-color': 'var(--focus-outline-color)',
  } as React.CSSProperties;
  const content = (
    <>
      <Check />
      {children}
      <span className="color-indicator-focus" />
      <span className="color-indicator-ring" />
    </>
  );

  const indicatorClasses = classNames('color-indicator', className);

  if (isDefined(component)) {
    const extraProps: Record<string, unknown> = {
      ...otherProps,
      className: indicatorClasses,
      style: indicatorStyle,
      'data-size': size,
      'data-shape': shape,
      'data-checked': checked,
    };

    return React.cloneElement(component, extraProps, content);
  }

  return (
    <div
      {...otherProps}
      className={indicatorClasses}
      style={indicatorStyle}
      data-size={size}
      data-shape={shape}
      data-checked={checked}
    >
      {content}
    </div>
  );
}

export function TrashButton({
  onClick,
  size,
  className,
  ...props
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  size?: 'small';
  className?: string;
  'data-testid'?: string;
}) {
  return (
    <button
      type='button'
      className={`trash-button ${className || ''}`}
      aria-label={useIntl().formatMessage({id: 'i18n:a11y:keyboard-shortcuts:deselect-highlight-color'})}
      onClick={onClick}
      data-size={size}
      {...props}
    >
      <img src={trashIcon} alt='' />
    </button>
  );
}

// Export a styled wrapper with no styles to maintain compatibility with styled-components selectors
// This allows ColorIndicator to be used as a CSS selector (e.g., ${ColorIndicator}) in other
// styled-components while the actual styling is handled by ColorIndicator.css
export default styled(ColorIndicator)``;
