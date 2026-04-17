import React from 'react';
import styled from 'styled-components/macro';
import classNames from 'classnames';
import Times from '../../../components/Times';
import theme from '../../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  toolbarIconColor,
  verticalNavbarMaxWidth,
} from '../constants';
import { toolbarIconStyles } from './iconStyles';
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

export const buttonMinWidth = `45px`;

export const PlainButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    theme?: unknown;
    isActive?: boolean;
    practiceQuestionsEnabled?: boolean;
  }
>(function PlainButton(
  {
    className, style, theme: _theme, isActive: _isActive,
    practiceQuestionsEnabled: _practiceQuestionsEnabled, ...domProps
  },
  ref
) {
  // Non-DOM props filtered out via destructuring

  return (
    <button
      ref={ref}
      {...domProps}
      className={classNames('toolbar-plain-button', className)}
      style={
        {
          '--toolbar-icon-color': toolbarIconColor.base,
          '--toolbar-icon-darker-color': toolbarIconColor.darker,
          '--button-min-width': buttonMinWidth,
          ...style,
        } as React.CSSProperties
      }
    />
  );
});

export const PrintOptWrapper = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
    theme?: unknown;
  }
>(function PrintOptWrapper({ isActive, className, style, ...props }, ref) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <PlainButton
      ref={ref}
      {...domProps}
      className={classNames('toolbar-print-opt-wrapper', className)}
      style={style}
    />
  );
});

export const PrintOptions = styled(function PrintOptions({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <span
      {...domProps}
      className={classNames('toolbar-print-options', className)}
    />
  );
})``;

export const PrintIcon = styled(PrintIconComponent)`
  ${toolbarIconStyles}
`;

export const ToolbarWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isMobileMenuOpen?: boolean;
    theme?: unknown;
  }
>(function ToolbarWrapper(
  { isMobileMenuOpen, className, style, ...props },
  ref
) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div
      ref={ref}
      {...domProps}
      className={classNames(
        'toolbar-wrapper',
        { 'mobile-menu-open': isMobileMenuOpen },
        className
      )}
      style={
        {
          '--toolbar-sticky-top-desktop': `${bookBannerDesktopMiniHeight}rem`,
          '--toolbar-sticky-top-mobile': `${bookBannerMobileMiniHeight}rem`,
          '--vertical-navbar-max-width': `${verticalNavbarMaxWidth}rem`,
          '--toolbar-z-index': theme.zIndex.toolbar,
          '--neutral-darker-color': theme.color.neutral.darker,
          '--neutral-form-border-color': theme.color.neutral.formBorder,
          '--sidebar-desktop-width': `${sidebarDesktopWidth}rem`,
          '--mobile-menu-z-index': theme.zIndex.mobileMenu,
          ...style,
        } as React.CSSProperties
      }
    />
  );
});

export const ToolbarMobileHeader = function ToolbarMobileHeader({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div
      {...domProps}
      className={classNames('toolbar-mobile-header', className)}
      style={
        {
          '--neutral-form-border-color': theme.color.neutral.formBorder,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const ToolbarMobileHeaderTitle = function ToolbarMobileHeaderTitle({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <span
      {...domProps}
      className={classNames('toolbar-mobile-header-title', className)}
      style={
        {
          '--primary-gray-color': theme.color.primary.gray.base,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const TimesIcon = function TimesIcon({
  className,
  style,
  ...props
}: React.SVGAttributes<SVGSVGElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <Times
      {...domProps}
      aria-hidden="true"
      className={classNames('toolbar-times-icon', className)}
      style={
        {
          '--toolbar-icon-color': toolbarIconColor.base,
          '--toolbar-icon-darker-color': toolbarIconColor.darker,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const LeftArrow = styled(ChevronLeftIcon)`
  width: 4rem;
  height: 4rem;
  color: ${toolbarIconColor.base};
  margin: 0 -1rem;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

export const ToolbarElements = function ToolbarElements({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div {...domProps} className={classNames('toolbar-elements', className)} />
  );
};
