import React from 'react';
import styled from 'styled-components/macro';
import classNames from 'classnames';
import theme from '../../../theme';
import { toolbarIconColor } from '../constants';
import './Toolbar.css';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * ChevronLeft icon for Toolbar component.
 * SVG path from Boxicons (https://boxicons.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function ChevronLeftIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"
      />
    </svg>
  );
}

export const ChevronLeftIcon = styled(ChevronLeftIconBase)``;

/**
 * Print icon for Toolbar component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function PrintIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M448 192V77.25c0-8.49-3.37-16.62-9.37-22.63L393.37 9.37c-6-6-14.14-9.37-22.63-9.37H96C78.33 0 64 14.33 64 32v160c-35.35 0-64 28.65-64 64v112c0 8.84 7.16 16 16 16h48v96c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32v-96h48c8.84 0 16-7.16 16-16V256c0-35.35-28.65-64-64-64zm-64 256H128v-96h256v96zm0-224H128V64h192v48c0 8.84 7.16 16 16 16h48v96zm48 72c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"
      />
    </svg>
  );
}

export const PrintIconComponent = styled(PrintIconBase)``;

// Plain React components using CSS classes
interface ToolbarWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobileMenuOpen: boolean;
  children: React.ReactNode;
}

export const ToolbarWrapper = React.forwardRef<HTMLDivElement, ToolbarWrapperProps>(
  function ToolbarWrapper({ isMobileMenuOpen, className, style, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={classNames('toolbar-wrapper', {
          'toolbar-wrapper--mobile-menu-open': isMobileMenuOpen,
        }, className)}
        style={{
          '--toolbar-z-index': theme.zIndex.toolbar,
          '--mobile-menu-z-index': theme.zIndex.mobileMenu,
          '--toolbar-bg-color': theme.color.neutral.darker,
          '--toolbar-border-color': theme.color.neutral.formBorder,
          '--toolbar-title-color': theme.color.primary.gray.base,
          '--toolbar-icon-color-base': toolbarIconColor.base,
          '--toolbar-icon-color-darker': toolbarIconColor.darker,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export function ToolbarMobileHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('toolbar-mobile-header', className)} {...props}>
      {children}
    </div>
  );
}

export function ToolbarMobileHeaderTitle({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={classNames('toolbar-mobile-header-title', className)} {...props}>
      {children}
    </span>
  );
}

export function ToolbarElements({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('toolbar-elements', className)} {...props}>
      {children}
    </div>
  );
}

interface PlainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PlainButton = React.forwardRef<HTMLButtonElement, PlainButtonProps>(
  function PlainButton({ className, style, children, ...props }, ref) {
    // Filter out transient props (starting with $) to prevent them from being forwarded to the DOM
    // Styled-components uses transient props for style-only props that shouldn't appear as HTML attributes
    const safeProps = Object.keys(props).reduce((acc, key) => {
      if (!key.startsWith('$')) {
        acc[key] = (props as Record<string, unknown>)[key];
      }
      return acc;
    }, {} as Record<string, unknown>) as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref}
        className={classNames('plain-button', className)}
        style={style}
        {...safeProps}
      >
        {children}
      </button>
    );
  }
);

interface PrintOptWrapperProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  children: React.ReactNode;
}

export const PrintOptWrapper = React.forwardRef<HTMLButtonElement, PrintOptWrapperProps>(
  function PrintOptWrapper({ isActive, className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={classNames('plain-button', 'print-opt-wrapper', {
          'print-opt-wrapper--active': isActive,
        }, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export function PrintOptions({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={classNames('print-options', className)} {...props}>
      {children}
    </span>
  );
}

export const PrintIcon = styled(PrintIconBase)``;
