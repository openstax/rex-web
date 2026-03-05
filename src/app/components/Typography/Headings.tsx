import React from 'react';
import classNames from 'classnames';
import theme from '../../theme';
import './Headings.css';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function H1({ children, className, style, ...props }: HeadingProps) {
  return (
    <h1
      {...props}
      className={classNames('typography-heading', 'typography-h1', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, style, ...props }: HeadingProps) {
  return (
    <h2
      {...props}
      className={classNames('typography-heading', 'typography-h2', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className, style, ...props }: HeadingProps) {
  return (
    <h3
      {...props}
      className={classNames('typography-heading', 'typography-h3', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className, style, ...props }: HeadingProps) {
  return (
    <h4
      {...props}
      className={classNames('typography-heading', 'typography-h4', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h4>
  );
}

export function H5({ children, className, style, ...props }: HeadingProps) {
  return (
    <h5
      {...props}
      className={classNames('typography-heading', 'typography-h5', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h5>
  );
}

export function H6({ children, className, style, ...props }: HeadingProps) {
  return (
    <h6
      {...props}
      className={classNames('typography-heading', 'typography-h6', className)}
      style={{
        ...style,
        '--heading-text-color': theme.color.text.default,
      } as React.CSSProperties}
    >
      {children}
    </h6>
  );
}

// Export constants for backward compatibility
export const h3MobileFontSize = 1.6;
export const h3MobileLineHeight = 2;

// Export class names as style strings for backward compatibility
// These maintain the API but components should use the actual components above
export const h3Style = 'typography-heading typography-h3';
export const h4DesktopStyle = 'typography-heading typography-h4';
export const h4MobileStyle = 'typography-heading typography-h4';
export const h4Style = 'typography-heading typography-h4';
