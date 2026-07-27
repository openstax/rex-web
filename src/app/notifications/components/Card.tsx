import React from 'react';
import classNames from 'classnames';
import theme from '../../theme';
/* CSS imported in src/app/notifications/index.ts */

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

export function Group({ className, style, ...props }: GroupProps) {
  const { theme: _theme, ...domProps } = props;
  return (
    <div
      {...domProps}
      className={classNames('notification-group', className)}
      style={{
        '--page-padding-mobile': `${theme.padding.page.mobile}rem`,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {
  theme?: unknown;
}

export function P({ className, style, ...props }: PProps) {
  const { theme: _theme, ...domProps } = props;
  return (
    <p
      {...domProps}
      className={classNames('notification-p', className)}
      style={{
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

export function Body({ className, style, children, ...props }: BodyProps) {
  const { theme: _theme, ...domProps } = props;
  return (
    <div
      className={classNames('notification-body', className)}
      style={{
        '--z-index-content-notifications': theme.zIndex.contentNotifications,
        '--neutral-darker-color': theme.color.neutral.darker,
        '--neutral-base-color': theme.color.neutral.base,
        '--neutral-darkest-color': theme.color.neutral.darkest,
        '--page-padding-mobile': `${theme.padding.page.mobile}rem`,
        ...style,
      } as React.CSSProperties}
    >
      <div {...domProps}>{children}</div>
    </div>
  );
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

export function Header({ className, style, ...props }: HeaderProps) {
  const { theme: _theme, ...domProps } = props;
  return (
    <div
      {...domProps}
      className={classNames('notification-header', className)}
      style={{
        '--text-color': theme.color.text.default,
        '--neutral-darker-color': theme.color.neutral.darker,
        ...style,
      } as React.CSSProperties}
    />
  );
}
