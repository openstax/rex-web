/**
 * Modal component wrappers using plain CSS
 * Migrated from styled-components to plain/global CSS
 */

import React from 'react';
import classNames from 'classnames';
import './Modal.css';
import theme from '../../theme';
import Times from '../Times';
import { toolbarIconColor } from '../../content/components/constants';
import { linkColor, linkHover } from '../Typography/Links.constants';

export const modalPadding = 3.0;

// Helper type for props that may have styled-components theme injected
// When wrapped by styled(), styled-components injects a theme prop that must be filtered out
type PropsWithPossibleTheme<T> = T & { theme?: unknown };

// ModalWrapper component
export function ModalWrapper(
  { className, style, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-wrapper', className)}
      style={{
        '--modal-z-index': theme.zIndex.errorPopup,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// CardWrapper component
export function CardWrapper(
  { className, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-card-wrapper', className)}
    />
  );
}

// Card component
export function Card(
  { className, style, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-card', className)}
      style={{
        '--link-color': linkColor,
        '--link-hover-color': linkHover,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// Header component
export function Header(
  { className, style, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLElement>>
) {
  return (
    <header
      {...props}
      className={classNames('modal-header', className)}
      style={style}
    />
  );
}

// Heading component
export function Heading(
  { className, style, children, theme: _theme, ...props }:
    PropsWithPossibleTheme<React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>>
) {
  return (
    <h1
      {...props}
      className={classNames('modal-heading', className)}
      style={style}
    >
      {children}
    </h1>
  );
}

// BodyHeading component
export function BodyHeading(
  { className, style, children, theme: _theme, ...props }:
    PropsWithPossibleTheme<React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>>
) {
  return (
    <h3
      {...props}
      className={classNames('modal-body-heading', className)}
      style={style}
    >
      {children}
    </h3>
  );
}

// Body component
export function Body(
  { className, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-body', className)}
    />
  );
}

// Mask component
export function Mask(
  { className, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-mask', className)}
    />
  );
}

// Footer component
export function Footer(
  { className, theme: _theme, ...props }: PropsWithPossibleTheme<React.HTMLAttributes<HTMLDivElement>>
) {
  return (
    <div
      {...props}
      className={classNames('modal-footer', className)}
    />
  );
}

// CloseModalIcon component with forwardRef
export const CloseModalIcon = React.forwardRef<
  HTMLButtonElement,
  PropsWithPossibleTheme<React.ButtonHTMLAttributes<HTMLButtonElement>>
>(
  function CloseModalIcon({ className, style, theme: _theme, ...props }, ref) {
    return (
      <button
        ref={ref}
        {...props}
        type="button"
        className={classNames('modal-close-icon', className)}
        style={{
          '--icon-color-lighter': toolbarIconColor.lighter,
          '--icon-color-base': toolbarIconColor.base,
          ...style,
        } as React.CSSProperties}
      >
        <Times aria-hidden="true" />
      </button>
    );
  }
);
