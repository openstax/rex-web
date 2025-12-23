/**
 * Media Query and Window Size Utilities
 *
 * This module provides React hooks for responsive design and window size detection:
 * - Media query matching (with automatic updates on changes)
 * - Mobile breakpoint detection
 * - Debounced window resize handling
 *
 * These utilities help create responsive user interfaces that adapt to different
 * screen sizes and device types.
 */

import type { MediaQueryListEvent } from '@openstax/types/lib.dom';
import React from 'react';
import theme from './theme';
import { assertWindow } from './utils';

/**
 * Hook that matches a CSS media query and updates when it changes.
 *
 * This hook uses the browser's matchMedia API to check if a media query matches,
 * and automatically updates the returned value when the match state changes
 * (e.g., when the window is resized).
 *
 * @param mediaQuery - CSS media query string (e.g., "(max-width: 768px)")
 * @returns Boolean indicating whether the media query currently matches
 *
 * @example
 * const isNarrow = useMatchMediaQuery('(max-width: 600px)');
 * return <div>{isNarrow ? 'Mobile' : 'Desktop'} view</div>;
 */
const useMatchMediaQuery = (mediaQuery: string) => {
  const matchMedia = React.useMemo(
    () => assertWindow().matchMedia(mediaQuery),
    [mediaQuery]
  );
  const [matches, listener] = React.useReducer(
    (_state: unknown, e: MediaQueryListEvent) => e.matches,
    matchMedia.matches
  );

  React.useEffect(() => {
    // Support both modern and legacy browsers
    if (typeof matchMedia.addEventListener === 'function') {
      matchMedia.addEventListener('change', listener);
    } else {
      matchMedia.addListener(listener);
    }
    return () => {
      if (typeof matchMedia.removeEventListener === 'function') {
        matchMedia.removeEventListener('change', listener);
      } else {
        matchMedia.removeListener(listener);
      }
    };
  }, [listener, matchMedia]);

  return matches;
};

/**
 * Hook that detects if the viewport matches the "mobile medium" breakpoint.
 *
 * Uses the theme's mobileMediumQuery breakpoint definition.
 *
 * @returns True if the viewport is within the mobile medium range
 *
 * @example
 * const isMobileMedium = useMatchMobileMediumQuery();
 * return <Menu compact={isMobileMedium} />;
 */
export const useMatchMobileMediumQuery = () => useMatchMediaQuery(theme.breakpoints.mobileMediumQuery);

/**
 * Hook that detects if the viewport matches the "mobile" breakpoint.
 *
 * Uses the theme's mobileQuery breakpoint definition.
 *
 * @returns True if the viewport is within the mobile range
 *
 * @example
 * const isMobile = useMatchMobileQuery();
 * return <Navigation layout={isMobile ? 'stacked' : 'horizontal'} />;
 */
export const useMatchMobileQuery = () => useMatchMediaQuery(theme.breakpoints.mobileQuery);

/**
 * Hook that provides debounced window dimensions.
 *
 * Returns the current window width and height as a tuple [width, height].
 * Updates are debounced by 50ms to avoid excessive re-renders during resizing.
 *
 * @returns Tuple of [width, height] in pixels
 *
 * @example
 * const [width, height] = useDebouncedWindowSize();
 * return <div>Window is {width}x{height}</div>;
 */
export const useDebouncedWindowSize = () => {
  const window = assertWindow();
  const timeout = React.useRef(0);
  const [size, setSize] = React.useState([window.innerWidth, window.innerHeight]);

  React.useLayoutEffect(() => {
    const updateSize = () => {
      clearTimeout(timeout.current);
      // Debounce resize events to avoid performance issues
      timeout.current = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 50);
    };
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timeout.current);
      window.removeEventListener('resize', updateSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return size;
};
