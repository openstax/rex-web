import React from 'react';
import classNames from 'classnames';
import Times from '../../../components/Times';
import { PlainButton } from '../components/Button';
import theme from '../../theme';
import { disablePrintClass } from '../components/utils/disablePrint';
import { BookWithOSWebData } from '../types';
import './PopupStyles.css';

// Re-export constants from PopupConstants
export * from './PopupConstants';

interface PopupWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * PopupWrapper component - plain CSS version
 */
export function PopupWrapper({ className, ...props }: PopupWrapperProps) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <div
      {...domProps}
      className={classNames('popup-wrapper', className)}
    />
  );
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  colorSchema: BookWithOSWebData['theme'];
  theme?: unknown;
}

/**
 * Header component - plain CSS version with dynamic theming
 */
export function Header({ colorSchema, className, style, ...props }: HeaderProps) {
  const { theme: _theme, ...domProps } = props as any;
  const backgroundColor = theme.color.primary[colorSchema].base;
  const textColor = theme.color.primary[colorSchema].foreground;

  return (
    <div
      {...domProps}
      className={classNames('popup-header', disablePrintClass, className)}
      style={{
        '--popup-background-color': backgroundColor,
        color: textColor,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface PopupBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * PopupBody component - plain CSS version
 */
export function PopupBody({ className, style, ...props }: PopupBodyProps) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <div
      {...domProps}
      className={classNames('popup-body', className)}
      style={{
        '--popup-body-background': theme.color.neutral.base,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * Modal component - plain CSS version
 */
export function Modal({ className, style, ...props }: ModalProps) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <div
      {...domProps}
      className={classNames('popup-modal', className)}
      style={{
        '--popup-modal-background': theme.color.neutral.base,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface CloseIconWrapperProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: unknown;
}

/**
 * CloseIconWrapper component - plain CSS version
 */
export const CloseIconWrapper = React.forwardRef<HTMLButtonElement, CloseIconWrapperProps>(
  function CloseIconWrapper({ className, ...props }, ref) {
    const { theme: _theme, ...domProps } = props as any;
    // Filter out transient props (starting with $) to prevent them from being forwarded to the DOM
    const safeProps = Object.keys(domProps).reduce((acc, key) => {
      if (!key.startsWith('$')) {
        acc[key] = domProps[key];
      }
      return acc;
    }, {} as Record<string, any>) as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <PlainButton
        ref={ref}
        {...safeProps}
        className={classNames('popup-close-icon-wrapper', className)}
      />
    );
  }
);

interface CloseIconProps extends React.SVGAttributes<SVGSVGElement> {
  colorSchema: BookWithOSWebData['theme'];
  theme?: unknown;
}

/**
 * CloseIcon component - plain CSS version with dynamic theming
 */
export const CloseIcon = React.forwardRef<SVGSVGElement, CloseIconProps>(
  function CloseIcon({ colorSchema, className, style, ...props }, ref) {
    const { theme: _theme, ...domProps } = props as any;
    const iconColor = theme.color.primary[colorSchema].foreground;
    const iconHoverColor = theme.color.primary[colorSchema].foregroundHover;

    return (
      <Times
        ref={ref as any}
        {...domProps}
        aria-hidden='true'
        focusable='true'
        className={classNames('popup-close-icon', disablePrintClass, className)}
        style={{
          '--popup-close-icon-color': iconColor,
          '--popup-close-icon-hover-color': iconHoverColor,
          ...style,
        } as React.CSSProperties}
      />
    );
  }
);
