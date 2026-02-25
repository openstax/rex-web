import React from 'react';
import classNames from 'classnames';
import './HiddenLink.css';

interface HiddenLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export default function HiddenLink({ children, className, ...props }: HiddenLinkProps) {
  return (
    <a {...props} className={classNames('hidden-link', className)}>
      {children}
    </a>
  );
}

interface HiddenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function HiddenButton({ children, className, ...props }: HiddenButtonProps) {
  return (
    <button {...props} className={classNames('hidden-button', className)}>
      {children}
    </button>
  );
}
