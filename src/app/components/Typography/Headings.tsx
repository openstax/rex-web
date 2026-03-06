import React from 'react';
import { css } from 'styled-components/macro';
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

// Base heading style helper
const headingStyle = (fontSize: string, lineHeight: string, topPadding: string) => css`
  color: ${theme.color.text.default};
  font-size: ${fontSize};
  line-height: ${lineHeight};
  letter-spacing: -0.02rem;
  padding: ${topPadding} 0 1rem 0;
  margin: 0;
`;

// Export styled-components css fragments for backward compatibility
// These maintain compatibility with existing code that interpolates them in styled-components
export const h3Style = css`
  ${headingStyle('2.4rem', '3rem', '1.5rem')}
  ${theme.breakpoints.mobile(css`
    font-size: ${h3MobileFontSize}rem;
    line-height: ${h3MobileLineHeight}rem;
  `)}
`;

export const h4DesktopStyle = css`
  ${headingStyle('1.8rem', '2.5rem', '1rem')}
`;

export const h4MobileStyle = css`
  ${headingStyle('1.6rem', '2rem', '1rem')}
`;

export const h4Style = css`
  ${h4DesktopStyle}
  ${theme.breakpoints.mobile(h4MobileStyle)}
`;
