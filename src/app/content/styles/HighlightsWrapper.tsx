import classNames from 'classnames';
import React from 'react';
import './HighlightsWrapper.css';

/**
 * HighlightsWrapper component - plain CSS version
 *
 * Note: Wrapped with forwardRef to support ref prop usage in existing code
 * Note: Filters out theme prop to prevent DOM attribute leakage
 */
export const HighlightsWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
>(function HighlightsWrapper({ className, theme: _theme, ...domProps }, ref) {
  return (
    <div
      ref={ref}
      {...domProps}
      className={classNames('highlights-wrapper', className)}
    />
  );
});

export default HighlightsWrapper;
