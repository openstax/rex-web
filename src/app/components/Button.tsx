import React from 'react';
import classNames from 'classnames';
import { HTMLButtonElement, HTMLDivElement } from '@openstax/types/lib.dom';
import { isDefined } from '../guards';
import theme from '../theme';
import { linkColor, linkHover } from './Typography/Links.constants';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'transparent' | 'default';
type Size = 'large' | 'medium' | 'small';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentType = keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>;

interface ButtonProps<T extends ComponentType | undefined> extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  component?: T extends undefined ? undefined :
    T extends ComponentType ? React.ReactComponentElement<T>:
    never;
}

export function Button<T extends ComponentType | undefined>({
  variant = 'default',
  size = 'medium',
  disabled = false,
  className,
  style,
  component,
  ...props
}: ButtonProps<T>) {
  const classes = classNames(
    'button',
    `button-${variant}`,
    `button-${size}`,
    { 'button-disabled': disabled },
    className
  );

  const cssVariables = {
    '--button-primary-color': theme.color.primary.orange.base,
    '--button-primary-foreground': theme.color.primary.orange.foreground,
    '--button-primary-hover': theme.color.primary.orange.darker,
    '--button-primary-active': theme.color.primary.orange.darkest,
    '--button-focus-outline': theme.color.white,
    '--button-focus-shadow': theme.color.black,
    '--button-secondary-color': theme.color.secondary.lightGray.base,
    '--button-secondary-foreground': theme.color.secondary.lightGray.foreground,
    '--button-secondary-hover': theme.color.secondary.lightGray.darker,
    '--button-secondary-active': theme.color.secondary.lightGray.darkest,
    '--button-transparent-color': linkColor,
    '--button-default-color': theme.color.neutral.base,
    '--button-default-foreground': theme.color.primary.gray.base,
    '--button-default-hover': theme.color.neutral.darker,
    '--button-default-active': theme.color.neutral.darkest,
    '--button-default-border': theme.color.neutral.formBorder,
    '--button-disabled-color': theme.color.disabled.base,
    '--button-disabled-foreground': theme.color.disabled.foreground,
    ...style,
  } as React.CSSProperties;

  if (isDefined(component)) {
    return React.cloneElement(component, {
      ...props,
      className: classes,
      style: cssVariables,
      disabled,
    });
  }

  return (
    <button
      {...props}
      className={classes}
      style={cssVariables}
      disabled={disabled}
    />
  );
}

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  expand?: boolean;
  vertical?: boolean;
}

export function ButtonGroup({
  expand = true,
  vertical = false,
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      {...props}
      className={classNames(
        'button-group',
        { 'button-group-no-expand': expand === false },
        { 'button-group-vertical': vertical },
        className
      )}
    />
  );
}

export function PlainButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames('plain-button', className)}
    />
  );
}

interface ButtonLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  decorated?: boolean;
}

export function ButtonLink({
  decorated = false,
  className,
  style,
  ...props
}: ButtonLinkProps) {
  return (
    <PlainButton
      {...props}
      className={classNames(
        'button-link',
        { 'button-link-decorated': decorated },
        className
      )}
      style={{
        '--link-color': linkColor,
        '--link-hover': linkHover,
        ...style,
      } as React.CSSProperties}
    />
  );
}

export default Button;
