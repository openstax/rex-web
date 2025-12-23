/**
 * Scroll Event Utilities
 *
 * This module provides React hooks for monitoring and responding to scroll events:
 * - Document scroll position tracking
 *
 * These utilities help implement scroll-dependent behaviors like sticky headers,
 * scroll-to-top buttons, and infinite scrolling.
 */

import React from 'react';
import { assertDocument } from './utils';

/**
 * Hook that tracks the document's vertical scroll position.
 *
 * Returns the current scrollTop value of the document's scrolling element,
 * which updates whenever the user scrolls.
 *
 * @returns Current vertical scroll offset in pixels
 *
 * @example
 * const scrollTop = useOnScrollTopOffset();
 * const showBackToTop = scrollTop > 500;
 * return showBackToTop && <BackToTopButton />;
 */
export const useOnScrollTopOffset = () => {
  const document = assertDocument();
  const [topOffset, setTopOffset] = React.useState(0);

  const listener = React.useCallback(() => {
    setTopOffset(document.scrollingElement ? document.scrollingElement.scrollTop : 0);
  }, [document]);

  React.useEffect(() => {
    document.addEventListener('scroll', listener);
    return () => { document.removeEventListener('scroll', listener); };
  }, [document, listener]);

  return topOffset;
};
