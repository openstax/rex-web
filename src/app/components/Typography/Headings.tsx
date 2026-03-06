import React from 'react';
import { css } from 'styled-components/macro';
import classNames from 'classnames';
import theme from '../../theme';
import './Headings.css';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

// Base heading component that accepts a tag type and CSS class
function Heading({
  tag: Tag,
  cssClass,
  children,
  className,
  style,
  ...props
}: HeadingProps & {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  cssClass: string;
}) {
  return (
    <Tag
      {...props}
      className={classNames('typography-heading', cssClass, className)}
      style={{
        '--heading-text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

export function H1(props: HeadingProps) {
  return <Heading tag="h1" cssClass="typography-h1" {...props} />;
}

export function H2(props: HeadingProps) {
  return <Heading tag="h2" cssClass="typography-h2" {...props} />;
}

export function H3(props: HeadingProps) {
  return <Heading tag="h3" cssClass="typography-h3" {...props} />;
}

export function H4(props: HeadingProps) {
  return <Heading tag="h4" cssClass="typography-h4" {...props} />;
}

export function H5(props: HeadingProps) {
  return <Heading tag="h5" cssClass="typography-h5" {...props} />;
}

export function H6(props: HeadingProps) {
  return <Heading tag="h6" cssClass="typography-h6" {...props} />;
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
