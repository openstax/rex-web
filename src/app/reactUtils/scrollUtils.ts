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
import { assertDocument } from '../utils';

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
