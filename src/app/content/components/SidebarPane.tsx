import React from 'react';
import classNames from 'classnames';
import { HTMLDivElement, HTMLElement } from '@openstax/types/lib.dom';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import theme from '../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarIconColor,
  topbarDesktopHeight,
  topbarMobileHeight,
} from './constants';
import './SidebarPane.css';

const sidebarPadding = 1.8;

interface SidebarPaneBodyProps extends React.HTMLAttributes<HTMLElement> {
  isTocOpen: boolean | null;
}

/**
 * SidebarPaneBody component - Main sidebar navigation container
 *
 * Migrated from styled-components to plain CSS.
 */
export const SidebarPaneBody = React.forwardRef<HTMLElement, SidebarPaneBodyProps>(
  function SidebarPaneBody({ isTocOpen, className, style, children, ...props }, ref) {
    // Determine sidebar closed state
    // - If isTocOpen is null, sidebar is closed on mobile only
    // - If isTocOpen is false, sidebar is closed on all breakpoints
    const isClosed = isTocOpen === false;
    const isClosedMobile = isTocOpen === null;

    return (
      <nav
        {...props}
        ref={ref}
        className={classNames('sidebar-pane-body', className)}
        data-sidebar-closed={isClosed}
        data-sidebar-closed-mobile={isClosedMobile}
        style={{
          '--sidebar-top-desktop': `${bookBannerDesktopMiniHeight}rem`,
          '--sidebar-top-mobile': `${bookBannerMobileMiniHeight}rem`,
          '--sidebar-height-desktop': `calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem)`,
          '--sidebar-height-mobile': `calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem)`,
          '--sidebar-max-height-desktop': `calc(100vh - ${bookBannerDesktopMiniHeight}rem)`,
          '--sidebar-max-height-mobile': `calc(100vh - ${bookBannerMobileMiniHeight}rem)`,
          '--sidebar-transition-time': `${sidebarTransitionTime}ms`,
          '--sidebar-bg-color': theme.color.neutral.darker,
          '--sidebar-z-index': theme.zIndex.sidebar,
          '--sidebar-z-index-mobile-medium': theme.zIndex.sidebarMobileMedium,
          '--sidebar-width-desktop': `${sidebarDesktopWidth}rem`,
          '--sidebar-width-mobile': `${sidebarMobileWidth}rem`,
          '--sidebar-padding': `${sidebarPadding}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </nav>
    );
  }
);

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Header component - Sidebar header container
 *
 * Migrated from styled-components to plain CSS.
 */
export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  function Header({ className, style, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames('sidebar-header', className)}
        style={{
          '--topbar-height-desktop': `${topbarDesktopHeight}rem`,
          '--topbar-height-mobile': `${topbarMobileHeight}rem`,
          '--sidebar-padding': `${sidebarPadding}rem`,
          '--form-border-color': theme.color.neutral.formBorder,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);

interface HeaderTextProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * HeaderText component - Sidebar header text/title
 *
 * Migrated from styled-components to plain CSS.
 */
export const HeaderText = React.forwardRef<HTMLHeadingElement, HeaderTextProps>(
  function HeaderText({ className, style, children, ...props }, ref) {
    return (
      <h2
        {...props}
        ref={ref}
        className={classNames('sidebar-header-text', className)}
        style={{
          '--toolbar-icon-color': toolbarIconColor.base,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </h2>
    );
  }
);
