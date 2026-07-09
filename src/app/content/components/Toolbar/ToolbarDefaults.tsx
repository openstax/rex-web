import React from 'react';
import classNames from 'classnames';
import { PlainButton } from './styled';
import './buttonStyles.css';

/**
 * Used by HighlightButton, StudyGuidesButton, and PracticeQuestionsButton.
 */

export function ToolbarDefaultButton({
  isActive,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
}) {
  return (
    <PlainButton
      {...props}
      className={classNames(
        'toolbar-default-button',
        { 'is-active': isActive },
        className
      )}
    />
  );
}

export function ToolbarDefaultText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={classNames('toolbar-default-text', className)}
    />
  );
}

export function ToolbarDefaultIcon({
  className,
  ...props
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'aria-hidden'>) {
  return (
    <img
      {...props}
      alt=""
      aria-hidden="true"
      className={classNames('toolbar-default-icon', className)}
    />
  );
}
