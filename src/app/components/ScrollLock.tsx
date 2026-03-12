import classNames from 'classnames';
import React, { HTMLAttributes, useEffect } from 'react';
import { sidebarTransitionTime, topbarDesktopHeight } from '../content/components/constants';
import { useDisableContentTabbing } from '../reactUtils';
import theme from '../theme';
import OnScroll, { OnTouchMoveCallback } from './OnScroll';
// Note: ScrollLock.css is imported globally from src/app/index.tsx to ensure consistent
// CSS ordering across code-split chunks

// Reference counting for scroll lock instances
// This ensures the body class is only removed when the last instance unmounts
const scrollLockRefCounts = {
  standard: 0,
  mediumScreensOnly: 0,
};

interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  mediumScreensOnly?: boolean;
  zIndex?: number;
}

export function Overlay({
  mediumScreensOnly,
  zIndex,
  className,
  style,
  ...props
}: OverlayProps) {
  useDisableContentTabbing(mediumScreensOnly ? false : true);

  return (
    <div
      {...props}
      className={classNames('scroll-lock-overlay', {
        'scroll-lock-overlay-medium-screens-only': mediumScreensOnly,
      }, className)}
      style={{
        '--scroll-lock-transition-time': `${sidebarTransitionTime}ms`,
        '--scroll-lock-topbar-height': `${topbarDesktopHeight}rem`,
        '--scroll-lock-z-index': zIndex,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface Props {
  onClick?: () => void;
  overlay?: boolean;
  mediumScreensOnly?: boolean | undefined;
  zIndex?: number | undefined;
}

function ScrollLock({ onClick, overlay, mediumScreensOnly, zIndex }: Props) {
  // Add/remove body class for scroll locking with reference counting
  // This ensures the class is only removed when the last instance unmounts
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const lockType = mediumScreensOnly ? 'mediumScreensOnly' : 'standard';
    const scrollLockClass = mediumScreensOnly ? 'scroll-lock-medium-screens-only' : 'scroll-lock';

    // Increment reference count and add class
    scrollLockRefCounts[lockType]++;
    body.classList.add(scrollLockClass);

    return () => {
      // Decrement reference count and only remove class if this is the last instance
      scrollLockRefCounts[lockType]--;
      if (scrollLockRefCounts[lockType] === 0) {
        body.classList.remove(scrollLockClass);
      }
    };
  }, [mediumScreensOnly]);

  const blockScroll: OnTouchMoveCallback = (element, e) => {
    if (
      typeof window !== 'undefined'
      && window.matchMedia(theme.breakpoints.mobileQuery).matches
      && element === window
    ) {
      e.preventDefault();
    }
  };

  return (
    <OnScroll onTouchMove={blockScroll}>
      {overlay !== false && (
        <Overlay
          data-testid='scroll-lock-overlay'
          onClick={onClick}
          mediumScreensOnly={mediumScreensOnly}
          zIndex={zIndex}
        />
      )}
    </OnScroll>
  );
}

export default ScrollLock;
