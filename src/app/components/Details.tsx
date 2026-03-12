import React from 'react';
import classNames from 'classnames';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import '../../polyfill/details';
// Note: Details.css is imported globally from src/app/index.tsx to ensure consistent
// CSS ordering across code-split chunks

export const iconSize = 1.7;

interface IconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
  size?: number | string;
}

export function ExpandIcon({ className, ...props }: IconProps) {
  return <CaretRight className={classNames('details-expand-icon', className)} {...props} />;
}

export function CollapseIcon({ className, ...props }: IconProps) {
  return <CaretDown className={classNames('details-collapse-icon', className)} {...props} />;
}

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
