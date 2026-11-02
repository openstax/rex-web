import React from 'react';
import classNames from 'classnames';
import Times from '../../components/Times';
import { PlainButton } from '../../components/Button';
import theme from '../../theme';
import { disablePrintClass } from '../components/utils/disablePrint';
import { BookWithOSWebData } from '../types';
import * as PopupConstants from './PopupConstants';
import './PopupStyles.css';

// Re-export constants from PopupConstants
export * from './PopupConstants';

type PopupWrapperProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * PopupWrapper component - plain CSS version
 */
export function PopupWrapper({ className, ...domProps }: PopupWrapperProps) {
  return (
    <div
      {...domProps}
      className={classNames('popup-wrapper', className)}
    />
  );
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  colorSchema: BookWithOSWebData['theme'];
}

/**
 * Header component - plain CSS version with dynamic theming
 */
export function Header({ colorSchema, className, style, ...domProps }: HeaderProps) {
  const backgroundColor = theme.color.primary[colorSchema].base;
  const textColor = theme.color.primary[colorSchema].foreground;

  return (
    <div
      {...domProps}
      className={classNames('popup-header', disablePrintClass, className)}
      style={{
        '--popup-background-color': backgroundColor,
        '--popup-padding': `${PopupConstants.popupPadding}rem`,
        '--header-height': `${PopupConstants.headerHeight}rem`,
        '--popup-header-z-index': PopupConstants.popupHeaderZIndex,
        '--mobile-padding-sides': `${PopupConstants.mobilePaddingSides}rem`,
        color: textColor,
        ...style,
      } as React.CSSProperties}
    />
  );
}

type PopupBodyProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * PopupBody component - plain CSS version with forwardRef support
 */
export const PopupBody = React.forwardRef<HTMLDivElement, PopupBodyProps>(
  function PopupBody({ className, style, ...domProps }, ref) {
    return (
        <div
        ref={ref}
        {...domProps}
        className={classNames('popup-body', className)}
        style={{
            '--popup-body-background': theme.color.neutral.base,
            '--header-height': `${PopupConstants.headerHeight}rem`,
            '--popup-body-z-index': PopupConstants.popupHeaderZIndex - 1,
            ...style,
        } as React.CSSProperties}
        />
    );
  }
);

type ModalProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Modal component - plain CSS version with forwardRef support
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  function Modal({ className, style, ...domProps }, ref) {
    return (
      <div
        ref={ref}
        {...domProps}
        className={classNames('popup-modal', className)}
        style={{
          '--popup-modal-background': theme.color.neutral.base,
          '--popup-modal-z-index': theme.zIndex.highlightSummaryPopup,
          '--header-height': `${PopupConstants.headerHeight}rem`,
          '--popup-body-padding': `${PopupConstants.popupBodyPadding}rem`,
          '--top-bottom-margin': `${PopupConstants.topBottomMargin}rem`,
          '--mobile-margin-sides': `${PopupConstants.mobileMarginSides}rem`,
          '--mobile-margin-top-bottom': `${PopupConstants.mobileMarginTopBottom}rem`,
          ...style,
        } as React.CSSProperties}
      />
    );
  }
);

type CloseIconWrapperProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** CloseIconWrapper component - plain CSS version */
export const CloseIconWrapper = React.forwardRef<HTMLButtonElement, CloseIconWrapperProps>(
  function CloseIconWrapper({ className, ...props }, ref) {
    return (
      <PlainButton
        ref={ref}
        {...props}
        className={classNames('popup-close-icon-wrapper', className)}
      />
    );
  }
);

interface CloseIconProps extends React.SVGAttributes<SVGSVGElement> {
  colorSchema: BookWithOSWebData['theme'];
}

/**
 * CloseIcon component - plain CSS version with dynamic theming
 */
export function CloseIcon({ colorSchema, className, style, ...domProps }: CloseIconProps) {
  const iconColor = theme.color.primary[colorSchema].foreground;
  const iconHoverColor = theme.color.primary[colorSchema].foregroundHover;

  return (
    <Times
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
