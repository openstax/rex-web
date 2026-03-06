/**
 * Plain CSS Heading Components
 *
 * These components use plain CSS for styling with CSS variables bound from theme.ts.
 * No styled-components dependencies.
 *
 * For legacy styled-components css exports (h3Style, h4Style, etc.),
 * see Headings.legacy.ts
 */

import React from 'react';
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
