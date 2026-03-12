import React from 'react';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import '../../polyfill/details';
import './Details.css';

export const iconSize = 1.7;

interface IconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
  size?: number | string;
}

export const ExpandIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <CaretRight className={`details-expand-icon ${className || ''}`} {...props} />
);

export const CollapseIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <CaretDown className={`details-collapse-icon ${className || ''}`} {...props} />
);

export const Summary: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  className,
  ...props
}) => (
  <summary className={`details-summary ${className || ''}`} {...props}>
    {children}
  </summary>
);

export const Details: React.FC<React.DetailsHTMLAttributes<HTMLDetailsElement>> = ({
  children,
  className,
  ...props
}) => (
  <details className={className} {...props}>
    {children}
  </details>
);
