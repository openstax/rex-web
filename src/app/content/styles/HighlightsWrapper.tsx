import classNames from 'classnames';
import React from 'react';
import './HighlightsWrapper.css';

/**
 * HighlightsWrapper component - plain CSS version
 *
 * Note: Wrapped with forwardRef to support ref prop usage in existing code
 */
export const HighlightsWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HighlightsWrapper({ className, ...domProps }, ref) {
  return (
    <div
      ref={ref}
      {...domProps}
      className={classNames('highlights-wrapper', className)}
    />
  );
});

export default HighlightsWrapper;
