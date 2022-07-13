import { HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedWindowSize, useOnScrollTopOffset } from '../../../reactUtils';
import { assertDocument, remsToPx } from '../../../utils';
import { page as pageSelector } from '../../selectors';
import { hasStudyGuides } from '../../studyGuides/selectors';
import { Page } from '../../types';
import {
  arrowDesktopHeight,
  arrowRightMargin,
  arrowTopMargin,
  closeButtonDistanceFromContent,
  closeButtonSize,
  contentMarginLeft,
  contentMarginTop,
  contentWidth,
  cookieNudge,
  daysUntilCookieExpires,
  mobileNudgeStudyToolsTargetId,
  mobileSpotlightPadding,
  nudgeStudyToolsMinPageLimit,
  nudgeStudyToolsShowLimit,
  nudgeStudyToolsTargetId,
  timeIntervalBetweenShowingNudgeInMs,
} from './constants';

interface Positions {
  arrowLeft: number;
  arrowTopOffset: number;
  closeButtonLeft: number;
  closeButtonTopOffset: number;
  contentWrapperLeft: number;
  contentWrapperTopOffset: number;
  spotlightHeight: number;
  spotlightLeftOffset: number;
  spotlightTopOffset: number;
  spotlightWidth: number;
}

export const getPositions = (target: HTMLElement, isMobile: boolean): Positions => {
  const padding = remsToPx(mobileSpotlightPadding);
  const { top, left, height, width } = getBoundingRectOfNudgeTarget(target);
  const spotlightLeftOffset = left - (isMobile ? padding : 0);
  const spotlightWidth = width + (isMobile ? padding * 2 : 0);
  const arrowTopOffset = top + height + remsToPx(arrowTopMargin);
  // left edge of arrow image should be on the middle of the spotlight (adjusted for a margin)
  const arrowLeft = spotlightLeftOffset + (spotlightWidth / 2) - remsToPx(arrowRightMargin);

  const contentWrapperTopOffset = arrowTopOffset
    + remsToPx(arrowDesktopHeight)
    + remsToPx(contentMarginTop);
  const contentWrapperLeft = spotlightLeftOffset + spotlightWidth + remsToPx(contentMarginLeft);
  const closeButtonLeft = contentWrapperLeft + remsToPx(contentWidth) + remsToPx(closeButtonDistanceFromContent);
  const closeButtonTopOffset = contentWrapperTopOffset
    - remsToPx(closeButtonSize)
    - remsToPx(closeButtonDistanceFromContent);

  return {
    arrowLeft,
    arrowTopOffset,
    closeButtonLeft,
    closeButtonTopOffset,
    contentWrapperLeft,
    contentWrapperTopOffset,
    spotlightHeight: height,
    spotlightLeftOffset,
    spotlightTopOffset: top,
    spotlightWidth,
  };
};

// Target may have display set to `contents` so we are calculatings rect for children of passed target.
const getBoundingRectOfNudgeTarget = (target: HTMLElement) => {
  const { top, bottom, left, right } = Array.from(target.children).reduce((rects, child) => {
    const rect = child.getBoundingClientRect();
    rects.top = Math.min(rects.top, rect.top);
    rects.bottom = Math.max(rects.bottom, rect.bottom);
    rects.left = Math.min(rects.left, rect.left);
    rects.right = Math.max(rects.right, rect.right);
    return rects;
    // Starting values depends on if we checks for Math.max or Math.min
  }, { top: 9999, bottom: 0, left: 9999, right: 0 });

  return {
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
};

export const usePositions = (isMobile: boolean) => {
  const [windowWidth] = useDebouncedWindowSize();
  const scrollTopOffset = useOnScrollTopOffset();
  const [positions, setPositions] = React.useState<Positions | null>(null);
  const studyGuides = useSelector(hasStudyGuides);

  React.useEffect(() => {
    const document = assertDocument();
    const target = document.querySelector(
      `#${isMobile ? mobileNudgeStudyToolsTargetId : nudgeStudyToolsTargetId}`
    ) as HTMLElement | null;
    if (target) {
      // Make sure that we calculate positions with body overflow set to hidden
      // because it causes scrollbar to hide which results in different positions.
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setPositions(getPositions(target, isMobile));

      // Resets to the value from before calculations. We want this style change to be handled
      // directly in the component.
      document.body.style.overflow = prevOverflow;
    }
    return () => setPositions(null);
  }, [scrollTopOffset, studyGuides, windowWidth, isMobile]);

  return positions;
};

export const getCounterCookie = () => {
  return Number(Cookies.get(cookieNudge.counter) || 0);
};

export const getDateCookie = () => {
  const lastShownDate = Cookies.get(cookieNudge.date);
  return lastShownDate ? new Date(lastShownDate) : undefined;
};

export const passedTimeInterval = () => {
  const lastShownDate = getDateCookie();
  return !lastShownDate
    ? true
    : (Date.now() - lastShownDate.getTime()) > timeIntervalBetweenShowingNudgeInMs
  ;
};

export const getPageCounterCookie = () => {
  return Number(Cookies.get(cookieNudge.pageCounter) || 0);
};

export const incrementPageCounterCookie = () => {
  const counter = getPageCounterCookie();
  const newValue = counter + 1;
  Cookies.set(cookieNudge.pageCounter, newValue.toString(), {expires: daysUntilCookieExpires});
  return newValue;
};

export const shouldDisplayNudgeStudyTools = (): boolean => {
  const counter = getCounterCookie();
  const numberOfPagesOpenedByUser = getPageCounterCookie();

  return counter < nudgeStudyToolsShowLimit
    && passedTimeInterval()
    && (numberOfPagesOpenedByUser >= nudgeStudyToolsMinPageLimit);
};

// Set required cookies and reset opened page counter
export const setNudgeStudyToolsCookies = () => {
  const now = new Date();
  const counter = getCounterCookie();
  Cookies.set(cookieNudge.counter, (counter + 1).toString(), {expires: daysUntilCookieExpires});
  Cookies.set(cookieNudge.date, now.toString(), {expires: daysUntilCookieExpires});
  Cookies.remove(cookieNudge.pageCounter);
};

export const useIncrementPageCounter = () => {
  const page = useSelector(pageSelector);
  const [counter, updateCounter] = useState<number>(getPageCounterCookie());
  const pageRef = React.useRef<Page>();

  React.useEffect(() => {
    if (page && page !== pageRef.current && counter <= nudgeStudyToolsMinPageLimit) {
      pageRef.current = page;
      updateCounter(incrementPageCounterCookie());
    }
  }, [page, updateCounter, counter]);

  return counter;
};
