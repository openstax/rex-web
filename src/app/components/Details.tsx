import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import '../../polyfill/details';
// Note: Details.css is imported globally from src/app/index.tsx to ensure consistent
// CSS ordering across code-split chunks

export const iconSize = 1.7;

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Expand icon (caret-right) for Details component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function ExpandIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={classNames('details-expand-icon', className)}
      viewBox="0 0 256 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"
      />
    </svg>
  );
}

export const ExpandIcon = styled(ExpandIconBase)``;

/**
 * Collapse icon (caret-down) for Details component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function CollapseIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={classNames('details-collapse-icon', className)}
      viewBox="0 0 320 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
      />
    </svg>
  );
}

export const CollapseIcon = styled(CollapseIconBase)``;

export function Summary({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <summary className={classNames('details-summary', className)} {...props}>
      {children}
    </summary>
  );
}

export const Details = React.forwardRef<HTMLDetailsElement, React.DetailsHTMLAttributes<HTMLDetailsElement>>(
  function Details({ children, className, ...props }, ref) {
    return (
      <details ref={ref} className={className} {...props}>
        {children}
      </details>
    );
  }
);
