import classNames from 'classnames';
import React from 'react';
import PrintButton from '../../components/Toolbar/PrintButton';
import './PrintButton.css';

interface PopUpPrintButtonProps extends React.ComponentProps<typeof PrintButton> {
  loading?: boolean;
  theme?: unknown;
}

/**
 * PopUpPrintButton component - plain CSS version
 *
 * Wraps the base Toolbar PrintButton with popup-specific styles
 */
export function PopUpPrintButton({ className, loading, theme: _theme, ...props }: PopUpPrintButtonProps) {
  // Destructure theme to remove it, preventing it from being passed to the DOM

  return (
    <PrintButton
      {...props}
      className={classNames('popup-print-button', className)}
      data-loading={loading ? 'true' : 'false'}
    />
  );
}

export default PopUpPrintButton;
