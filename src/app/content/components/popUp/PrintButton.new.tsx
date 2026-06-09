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
export function PopUpPrintButton({ className, loading, ...props }: PopUpPrintButtonProps) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <PrintButton
      {...domProps}
      className={classNames('popup-print-button', className)}
      data-loading={loading ? 'true' : 'false'}
    />
  );
}

export default PopUpPrintButton;
