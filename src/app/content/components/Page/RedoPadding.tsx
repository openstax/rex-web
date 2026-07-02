import React from 'react';
import classNames from 'classnames';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import { layoutPadding } from '../../../components/Layout.constants';
import './RedoPadding.css';

/**
 * RedoPadding component - Applies wrapper padding and flex layout for content pages
 *
 * Migrated from styled-components to plain CSS.
 */
export default React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function RedoPadding({ className, style, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames('redo-padding', className)}
        style={{
          '--layout-padding-desktop': `${layoutPadding.desktop}rem`,
          '--layout-padding-mobile': `${layoutPadding.mobile}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);
