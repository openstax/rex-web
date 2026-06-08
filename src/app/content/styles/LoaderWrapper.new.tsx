import classNames from 'classnames';
import React from 'react';
import './LoaderWrapper.css';

/**
 * LoaderWrapper component - plain CSS version
 *
 * Note: Filters out theme prop to prevent DOM attribute leakage when wrapped by styled-components
 */
export function LoaderWrapper(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <div
      {...domProps}
      className={classNames('loader-wrapper', className)}
    />
  );
}

export default LoaderWrapper;
