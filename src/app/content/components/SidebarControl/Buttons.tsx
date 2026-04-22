import React from 'react';
import classNames from 'classnames';
import { toolbarIconColor } from '../constants';
import type { InnerProps } from './types';
import './SidebarControl.css';

interface ButtonTextProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonText: React.FC<ButtonTextProps> = ({ children, className }) => (
  <span className={classNames('sidebar-control-button-text', className)}>
    {children}
  </span>
);

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ children, style, className, ...props }, ref) => (
    <button
      ref={ref}
      className={`sidebar-control-close-button${className ? ` ${className}` : ''}`}
      style={{
        '--sidebar-control-icon-color-base': toolbarIconColor.base,
        '--sidebar-control-icon-color-darker': toolbarIconColor.darker,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  )
);

CloseButton.displayName = 'CloseButton';

interface OpenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: InnerProps['isOpen'];
  isActive?: boolean;
  children?: React.ReactNode;
}

export const OpenButton = React.forwardRef<HTMLButtonElement, OpenButtonProps>(
  ({ isOpen, isActive, children, style, className, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={`sidebar-control-open-button${className ? ` ${className}` : ''}`}
      data-active={isActive ?? isOpen ?? false}
      style={{
        '--sidebar-control-icon-color-base': toolbarIconColor.base,
        '--sidebar-control-icon-color-darker': toolbarIconColor.darker,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </button>
  )
);

OpenButton.displayName = 'OpenButton';
