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
import theme from '../theme';
import { assertWindow } from '../utils';

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

export const useMatchMobileMediumQuery = () => useMatchMediaQuery(theme.breakpoints.mobileMediumQuery);
export const useMatchMobileQuery = () => useMatchMediaQuery(theme.breakpoints.mobileQuery);

// Updates are debounced by 50ms to avoid excessive re-renders
export const useDebouncedWindowSize = () => {
  const window = assertWindow();
  const timeout = React.useRef<ReturnType <typeof setTimeout>>();
  const [size, setSize] = React.useState([window.innerWidth, window.innerHeight]);

  React.useLayoutEffect(() => {
    const updateSize = () => {
      clearTimeout(timeout.current);
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
