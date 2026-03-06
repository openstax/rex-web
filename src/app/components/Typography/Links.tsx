import React from 'react';
import classNames from 'classnames';
import theme from '../../theme';
import './Links.css';

interface DecoratedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * DecoratedLink component
 * A link with no underline by default, underline on hover/focus
 * Supports disabled state
 */
export function DecoratedLink({ children, className, style, disabled, onClick, href, ...props }: DecoratedLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a
      {...props}
      href={disabled ? undefined : href}
      onClick={handleClick}
      className={classNames(
        'decorated-link-style',
        { 'decorated-link-style--disabled': disabled },
        className
      )}
      style={{
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
      tabIndex={disabled ? -1 : props.tabIndex}
      aria-disabled={disabled}
    >
      {children}
    </a>
  );
}
