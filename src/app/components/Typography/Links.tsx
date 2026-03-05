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
export function DecoratedLink({ children, className, style, disabled, ...props }: DecoratedLinkProps) {
  return (
    <a
      {...props}
      className={classNames(
        'decorated-link-style',
        { 'decorated-link-style--disabled': disabled },
        className
      )}
      style={{
        ...style,
        '--text-color': theme.color.text.default,
      } as React.CSSProperties}
      aria-disabled={disabled}
    >
      {children}
    </a>
  );
}
