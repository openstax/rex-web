import React from 'react';
import classNames from 'classnames';
import theme from '../theme';
import './Checkbox.css';

/**
 * Checkmark icon for the checkbox component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
function CheckIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      className={classNames('checkbox-icon', className)}
      viewBox="0 0 512 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
      />
    </svg>
  );
}

interface CheckboxProps {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Checkbox = ({ children, className, disabled, ...props }: CheckboxProps) => {
  return (
    <label
      className={classNames(
        'checkbox-label',
        { 'checkbox-disabled': disabled },
        className
      )}
      style={{
        '--text-color': theme.color.text.default,
        '--checkbox-border-color': theme.color.primary.gray.darker,
        '--checkbox-checked-bg': theme.color.primary.orange.darkest,
        '--checkbox-focus-bg': theme.color.neutral.pageBackground,
      } as React.CSSProperties}
    >
      <input type="checkbox" disabled={disabled} {...props} />
      <span className="checkbox-custom">
        <CheckIcon />
      </span>
      {children}
    </label>
  );
};

export default Checkbox;
