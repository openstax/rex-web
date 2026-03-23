import React from 'react';
import classNames from 'classnames';
import { isDefined } from '../guards';
import theme from '../theme';
import { linkColor, linkHover } from './Typography/Links.constants';
// Note: Button.css is imported globally from src/app/index.tsx to ensure consistent
// CSS ordering across code-split chunks and to avoid PrettyFormatPluginError in jest snapshots

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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps<ComponentType | undefined>>(function Button({
  variant = 'default',
  size = 'medium',
  disabled = false,
  className,
  style,
  component,
  ...props
}, ref) {
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
      ref,
      className: classes,
      style: cssVariables,
      disabled,
    });
  }

  return (
    <button
      {...props}
      ref={ref}
      className={classes}
      style={cssVariables}
      disabled={disabled}
    />
  );
});

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

export const PlainButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function PlainButton({ className, ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        className={classNames('plain-button', className)}
      />
    );
  }
);

interface ButtonLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  decorated?: boolean;
}

export const ButtonLink = React.forwardRef<HTMLButtonElement, ButtonLinkProps>(
  function ButtonLink({ decorated = false, className, style, ...props }, ref) {
    return (
      <PlainButton
        {...props}
        ref={ref}
        className={classNames(
          'button-link',
          { 'button-link-decorated': decorated },
          className
        )}
        style={{
          ...style,
          '--link-color': linkColor,
          '--link-hover': linkHover,
        } as React.CSSProperties}
      />
    );
  }
);

export default Button;
