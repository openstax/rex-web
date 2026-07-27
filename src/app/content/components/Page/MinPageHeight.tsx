import React from 'react';
import classNames from 'classnames';
import { HTMLDivElement } from '@openstax/types/lib.dom';
import { navDesktopHeight, navMobileHeight } from '../../../components/NavBar/constants';
import { desktopAttributionHeight, mobileAttributionHeight } from '../Attribution';
import {
  bookBannerDesktopBigHeight,
  bookBannerMobileBigHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
} from '../constants';
import './MinPageHeight.css';

const minDesktopContentSize =
  navDesktopHeight + bookBannerDesktopBigHeight + topbarDesktopHeight + desktopAttributionHeight;

const minMobileContentSize =
  navMobileHeight + bookBannerMobileBigHeight + topbarMobileHeight + mobileAttributionHeight;

/**
 * MinPageHeight component - Ensures minimum page height accounting for header elements
 *
 * Migrated from styled-components to plain CSS.
 */
export default React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function MinPageHeight({ className, style, children, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames('min-page-height', className)}
        style={{
          '--min-desktop-content-size': `${minDesktopContentSize}rem`,
          '--min-mobile-content-size': `${minMobileContentSize}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);
