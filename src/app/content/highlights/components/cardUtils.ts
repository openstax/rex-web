import { Highlight } from '@openstax/highlighter';
import { HTMLElement, } from '@openstax/types/lib.dom';
import React from 'react';
import { findElementSelfOrParent } from '../../../domUtils';
import { assertWindow } from '../../../utils';

export const useDebouncedWindowSize = () => {
  const window = assertWindow();
  const timeout = React.useRef(0);
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

export const getHighlightOffset = (container: HTMLElement | undefined, highlight: Highlight) => {
  if (!container || !highlight.range || !highlight.range.getBoundingClientRect) {
    return;
  }

  const {top, bottom } = highlight.range.getBoundingClientRect();

  const offsetParent = container.offsetParent && findElementSelfOrParent(container.offsetParent);
  const parentOffset = offsetParent ? offsetParent.offsetTop : 0;
  const scrollOffset = assertWindow().scrollY;

  return {
    bottom: bottom - parentOffset + scrollOffset,
    top: top - parentOffset + scrollOffset,
  };
};

export const getHighlightTopOffset = (container: HTMLElement | undefined, highlight: Highlight): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.top;
  }
};

export const getHighlightBottomOffset = (
  container: HTMLElement | undefined,
  highlight: Highlight
): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.bottom;
  }
};
