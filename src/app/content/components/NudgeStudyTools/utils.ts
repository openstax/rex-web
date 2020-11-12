import { HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedWindowSize, useOnScrollTopOffset } from '../../../reactUtils';
import { assertDocument, remsToPx } from '../../../utils';
import { page as pageSelector } from '../../selectors';
import { hasStudyGuides } from '../../studyGuides/selectors';
import {
  arrowDesktopHeight,
  arrowDesktopWidth,
  arrowLeftMargin,
  arrowMobileHeight,
  arrowMobileWidth,
  arrowTopMargin,
  closeButtonDistanceFromContent,
  contentMarginTop,
  cookieNudge,
  daysUntilCookieExpires,
  nudgeStudyToolsMinPageLimit,
  nudgeStudyToolsShowLimit,
  nudgeStudyToolsTargetId,
  spotlightPadding,
  timeIntervalBetweenShowingNudgeInMs,
} from './constants';

interface Positions {
  arrowLeft: number;
  arrowTopOffset: number;
  closeButtonLeft: number;
  closeButtonTopOffset: number;
  contentWrapperRight: number;
  contentWrapperTopOffset: number;
  spotlightHeight: number;
  spotlightLeftOffset: number;
  spotlightTopOffset: number;
  spotlightWidth: number;
}

export const getPositions = (target: HTMLElement, isMobile: boolean, windowWidth: number): Positions => {
  const { top, left, right, height, width } = getBoundingRectOfNudgeTarget(target);
  const padding = remsToPx(spotlightPadding);
  const spotlightTopOffset = top - padding;
  const spotlightLeftOffset = left - padding;
  const spotlightHeight = height + (padding * 2);
  const spotlightWidth = width + (padding * 2);
  const arrowTopOffset = spotlightTopOffset + spotlightHeight + remsToPx(arrowTopMargin);
  // right edge of arrow image should be on the middle of the spotlight (adjusted for a margin)
  const centerPoint = spotlightLeftOffset + (spotlightWidth / 2);
  const arrowWidth = remsToPx(isMobile ? arrowMobileWidth : arrowDesktopWidth);
  const arrowLeft = centerPoint - arrowWidth + remsToPx(arrowLeftMargin);

  const contentWrapperTopOffset = arrowTopOffset
    + remsToPx(isMobile ? arrowMobileHeight : arrowDesktopHeight)
    + remsToPx(contentMarginTop);
  const contentWrapperRight = windowWidth - right - padding;
  const closeButtonLeft = left + spotlightWidth;
  const closeButtonTopOffset = contentWrapperTopOffset - remsToPx(closeButtonDistanceFromContent);

  return {
    arrowLeft,
    arrowTopOffset,
    closeButtonLeft,
    closeButtonTopOffset,
    contentWrapperRight,
    contentWrapperTopOffset,
    spotlightHeight,
    spotlightLeftOffset,
    spotlightTopOffset,
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
    const target = document.querySelector(`#${nudgeStudyToolsTargetId}`) as HTMLElement | null;
    if (target) {
      // Make sure that we calculate positions with body overflow set to hidden
      // because it causes scrollbar to hide which results in different positions.
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setPositions(getPositions(target, isMobile, windowWidth));

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

  React.useEffect(() => {
    if (page && counter <= nudgeStudyToolsMinPageLimit) {
      updateCounter(incrementPageCounterCookie());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return counter;
};
