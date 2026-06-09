import classNames from 'classnames';
import React from 'react';
import './LoaderWrapper.css';

/**
 * LoaderWrapper component - plain CSS version
 *
 * Note: Filters out theme prop to prevent DOM attribute leakage
 */
export function LoaderWrapper(
  { className, theme: _theme, ...domProps }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) {
  return (
    <div
      {...domProps}
      className={classNames('loader-wrapper', className)}
    />
  );
}

export default LoaderWrapper;
