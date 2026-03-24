/**
 * Modal component wrappers using plain CSS
 * Migrated from styled-components to plain CSS modules
 */

import React from 'react';
import classNames from 'classnames';
import './Modal.css';
import theme from '../../theme';
import Times from '../Times';
import { toolbarIconColor } from '../../content/components/constants';

export const modalPadding = 3.0;

// ModalWrapper component
export function ModalWrapper({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
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
export function CardWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('modal-card-wrapper', className)} />;
}

// Card component
export function Card({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNames('modal-card', className)}
      style={{
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// Header component
export function Header({ className, style, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      {...props}
      className={classNames('modal-header', className)}
      style={{
        '--header-bg': theme.color.neutral.pageBackground,
        '--header-border': theme.color.neutral.darker,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// Heading component
export function Heading({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={classNames('modal-heading', className)}
      style={{
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// BodyHeading component
export function BodyHeading({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={classNames('modal-body-heading', className)}
      style={{
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    />
  );
}

// Body component
export function Body({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('modal-body', className)} />;
}

// Mask component
export function Mask({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('modal-mask', className)} />;
}

// Footer component
export function Footer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('modal-footer', className)} />;
}

// CloseModalIcon component
export function CloseModalIcon({ className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
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
