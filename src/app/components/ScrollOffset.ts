import { MouseEvent } from '@openstax/types/lib.dom';
import { useEffect, useRef } from 'react';
import { isHtmlElement } from '../guards';
import theme from '../theme';
import { assertWindow, remsToPx } from '../utils';
import './ScrollOffset.css';

interface ScrollOffsetProps {
  desktopOffset: number;
  mobileOffset: number;
}

/*
 * everything from here down is only necessary because some browsers do not support
 * scroll-padding. safari *claims* to support scroll-padding, but doesn't outside
 * the context of a scroll snap position
 *
 * https://bugs.webkit.org/show_bug.cgi?id=179379
 */

/*
 * how close to the element's getBoundingClientRect().top does the window
 * have to be after a scroll for us to think that it was intentionally scrolled
 * to
 *
 * this used to be 2 but safari has been seen producing up to 3.4
 */
const matchingThreshold = 4;

/*
 * number of times to check the scroll after page load before assuming everything
 * after that is triggered by the user scrolling.
 *
 * firefox seems to try to set the scroll twice a couple seconds apart on load, so
 * initial browser scroll + initial fix + second browser scroll = 3
 */
const pageLoadScrollChecks = 3;

function ScrollOffset({ desktopOffset, mobileOffset }: ScrollOffsetProps) {
  const propsRef = useRef({ desktopOffset, mobileOffset });

  // Update props ref when props change
  useEffect(() => {
    propsRef.current = { desktopOffset, mobileOffset };
  }, [desktopOffset, mobileOffset]);

  const getOffset = (window: Window) => {
    const { desktopOffset: desktop, mobileOffset: mobile } = propsRef.current;
    return -(window.matchMedia(theme.breakpoints.mobileQuery).matches
      ? remsToPx(mobile)
      : remsToPx(desktop));
  };

  const scrollForOffset = () => {
    const window = assertWindow();
    const targetId = window.location.hash.slice(1);
    const target = window.document.getElementById(targetId);

    if (!targetId || !target) {
      return;
    }

    if (Math.abs(target.getBoundingClientRect().top) < matchingThreshold) {
      window.scrollBy(0, getOffset(window));
    }
  };

  const checkScroll = (maxChecks = 1) => {
    let scrolls = 0;
    const handler = () => {
      scrolls++;
      if (scrolls >= maxChecks) {
        assertWindow().removeEventListener('scroll', handler);
      }
      scrollForOffset();
    };
    assertWindow().addEventListener('scroll', handler);
  };

  const resizeHandler = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const body = window.document.body;
    body.setAttribute('data-scroll-padding', String(getOffset(window)));
  };

  const hashchangeHandler = () => {
    checkScroll();
  };

  const clickHandler = (e: MouseEvent) => {
    if (isHtmlElement(e.target) && e.target.matches('a[href^="#"]')) {
      checkScroll();
    }
  };

  // Set up CSS variables for scroll-padding
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--scroll-offset-desktop', `${desktopOffset}rem`);
      document.documentElement.style.setProperty('--scroll-offset-mobile', `${mobileOffset}rem`);
    }
  }, [desktopOffset, mobileOffset]);

  // Component lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Add event listeners
    window.addEventListener('click', clickHandler);
    window.addEventListener('hashchange', hashchangeHandler);
    window.addEventListener('resize', resizeHandler);

    // Initial setup
    resizeHandler();
    checkScroll(pageLoadScrollChecks);

    // Cleanup
    return () => {
      const w = assertWindow();

      w.removeEventListener('click', clickHandler);
      w.removeEventListener('hashchange', hashchangeHandler);
      w.removeEventListener('resize', resizeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle resize on update
  useEffect(() => {
    resizeHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return null;
}

export default ScrollOffset;
