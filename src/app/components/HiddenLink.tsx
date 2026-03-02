import React from 'react';
import classNames from 'classnames';
import theme from '../theme';
import './HiddenLink.css';

interface HiddenLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export default function HiddenLink({ children, className, style, ...props }: HiddenLinkProps) {
  return (
    <a
      {...props}
      className={classNames('hidden-link', className)}
      style={{
        ...style,
        '--z-index-focused-hidden-link': theme.zIndex.focusedHiddenLink,
      } as React.CSSProperties}
    >
      {children}
    </a>
  );
}

interface HiddenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function HiddenButton({ children, className, style, ...props }: HiddenButtonProps) {
  return (
    <button
      {...props}
      className={classNames('hidden-button', className)}
      style={{
        ...style,
        '--z-index-focused-hidden-link': theme.zIndex.focusedHiddenLink,
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
}
