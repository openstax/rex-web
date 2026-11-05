import React from 'react';
import classNames from 'classnames';
import theme from '../../theme';
/* CSS imported in src/app/notifications/index.ts */

type GroupProps = React.HTMLAttributes<HTMLDivElement>;

export function Group({ className, style, ...domProps }: GroupProps) {
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

type PProps = React.HTMLAttributes<HTMLParagraphElement>;

export function P({ className, style, ...domProps }: PProps) {
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

type BodyProps = React.HTMLAttributes<HTMLDivElement>;

export function Body({ className, style, children, ...domProps }: BodyProps) {
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

type HeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function Header({ className, style, ...domProps }: HeaderProps) {
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
