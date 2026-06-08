import { HTMLDivElement } from '@openstax/types/lib.dom';
import classNames from 'classnames';
import React from 'react';
import './HighlightsWrapper.css';

/**
 * HighlightsWrapper component - plain CSS version
 *
 * Note: Wrapped with forwardRef to support ref prop usage in existing code
 * Note: Filters out theme prop to prevent DOM attribute leakage when wrapped by styled-components
 */
export const HighlightsWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
>(function HighlightsWrapper({ className, ...props }, ref) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <div
      ref={ref}
      {...domProps}
      className={classNames('highlights-wrapper', className)}
    />
  );
});

export default HighlightsWrapper;
