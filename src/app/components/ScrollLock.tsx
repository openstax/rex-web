import classNames from 'classnames';
import React, { HTMLAttributes, useEffect } from 'react';
import { sidebarTransitionTime, topbarDesktopHeight } from '../content/components/constants';
import { useDisableContentTabbing } from '../reactUtils';
import theme from '../theme';
import OnScroll, { OnTouchMoveCallback } from './OnScroll';
import './ScrollLock.css';

interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  mediumScreensOnly?: boolean;
  zIndex?: number;
}

export const Overlay: React.FC<OverlayProps> = ({
  mediumScreensOnly,
  zIndex,
  className,
  style,
  ...props
}) => {
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
};

interface Props {
  onClick?: () => void;
  overlay?: boolean;
  mediumScreensOnly?: boolean | undefined;
  zIndex?: number | undefined;
}

const ScrollLock: React.FC<Props> = ({ onClick, overlay, mediumScreensOnly, zIndex }) => {
  // Add/remove body class for scroll locking
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const scrollLockClass = mediumScreensOnly ? 'scroll-lock-medium-screens-only' : 'scroll-lock';

    body.classList.add(scrollLockClass);

    return () => {
      body.classList.remove(scrollLockClass);
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
};

export default ScrollLock;
