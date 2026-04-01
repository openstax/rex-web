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

// When component prop is provided, allow additional props that may be needed for that element type
// (e.g., href, target, rel for anchor elements). This provides backward compatibility for existing
// usages while the base type remains ButtonHTMLAttributes for standard button usage.
interface ButtonProps<T extends ComponentType | undefined> extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  component?: T extends undefined ? undefined :
    T extends ComponentType ? React.ReactComponentElement<T>:
    never;
  // Allow additional props for polymorphic usage (e.g., anchor attributes when component is an <a>)
  // NOTE: The index signature [key: string]: any disables type-checking for all Button usages.
  // A future improvement would be to implement full polymorphic typing using React.ElementType
  // and ComponentPropsWithoutRef<T>, but that requires a larger refactor. For now, this provides
  // backward compatibility for existing polymorphic usages while accepting reduced type safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// NOTE: The ref is typed as HTMLElement (not HTMLButtonElement) to support polymorphic usage.
// When component prop is not provided, Button renders as <button>, but when component is provided,
// it can be any element type. A future improvement would be to use ref type overloads or conditional
// types to provide HTMLButtonElement for the default case and HTMLElement for the polymorphic case.
// For now, this provides maximum flexibility while accepting some loss of type precision.
export const Button = React.forwardRef<HTMLElement, ButtonProps<ComponentType | undefined>>(function Button({
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
    // Merge className and style with component's existing props to avoid overwriting
    const mergedClassName = classNames(component.props.className, classes);
    const mergedStyle: React.CSSProperties = {
      ...(component.props.style || {}),
      ...cssVariables,
    };

    // Check if the component is a native form element that supports the disabled attribute
    const isIntrinsic = typeof component.type === 'string';
    const isFormElement =
      isIntrinsic &&
      ['button', 'input', 'select', 'textarea', 'fieldset'].includes(
        component.type as string
      );

    const extraProps: Record<string, unknown> = {
      ...props,
      ref,
      className: mergedClassName,
      style: mergedStyle,
    };

    if (isFormElement) {
      // Native form controls support the disabled attribute
      (extraProps as { disabled?: boolean }).disabled = disabled;
    } else if (disabled) {
      // For non-form elements (e.g., <a>), emulate disabled behavior accessibly
      (extraProps as { 'aria-disabled'?: boolean })['aria-disabled'] = true;
      (extraProps as { tabIndex?: number }).tabIndex = -1;

      // Block activation events when disabled
      (extraProps as { onClick?: React.MouseEventHandler<HTMLElement> }).onClick = (
        event: React.MouseEvent<HTMLElement>
      ) => {
        // Completely block activation when disabled - do not call any handlers
        event.preventDefault();
        event.stopPropagation();
        return;
      };

      const originalOnKeyDown = component.props.onKeyDown;
      const propOnKeyDown = (props as { onKeyDown?: React.KeyboardEventHandler<HTMLElement> }).onKeyDown;

      (extraProps as { onKeyDown?: React.KeyboardEventHandler<HTMLElement> }).onKeyDown = (
        event: React.KeyboardEvent<HTMLElement>
      ) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (typeof originalOnKeyDown === 'function') {
          originalOnKeyDown(event);
        }
        if (typeof propOnKeyDown === 'function') {
          propOnKeyDown(event);
        }
      };
    }

    return React.cloneElement(component, extraProps);
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
    // PlainButton accepts only standard HTML button attributes
    // It can be wrapped with styled-components for additional styling
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
          '--link-color': linkColor,
          '--link-hover': linkHover,
          ...style,
        } as React.CSSProperties}
      />
    );
  }
);

export default Button;
