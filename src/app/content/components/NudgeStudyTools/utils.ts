import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedWindowSize } from '../../../reactUtils';
import { assertDocument, remsToPx } from '../../../utils';
import { hasStudyGuides } from '../../studyGuides/selectors';
import { toolbarButtonMargin } from '../constants';
import {
  arrowDesktopHeight,
  arrowLeftMargin,
  arrowMobileHeight,
  arrowTopMargin,
  closeButtonDistanceFromContent,
  contentMarginTop,
  spotlightPadding,
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

export const usePositions = (target: HTMLElement | null, isMobile: boolean) => {
  const [windowWidth] = useDebouncedWindowSize();
  const [positions, setPositions] = React.useState<Positions | null>(null);

  React.useEffect(() => {
    if (target) {
      const { top, left, right, height, width } = target.getBoundingClientRect();
      const padding = remsToPx(spotlightPadding);
      const spotlightTopOffset = top - padding;
      const spotlightLeftOffset = left - padding;
      const spotlightHeight = height + (padding * 2);
      const spotlightWidth = width + (padding * 2) - (isMobile ? 0 : remsToPx(toolbarButtonMargin));
      const arrowTopOffset = spotlightTopOffset + spotlightHeight + remsToPx(arrowTopMargin);
      const arrowLeft = spotlightLeftOffset + remsToPx(arrowLeftMargin);
      const contentWrapperTopOffset = arrowTopOffset
        + remsToPx(isMobile ? arrowMobileHeight : arrowDesktopHeight)
        + remsToPx(contentMarginTop);
      const contentWrapperRight = windowWidth - right - padding;
      const closeButtonLeft = left + spotlightWidth;
      const closeButtonTopOffset = contentWrapperTopOffset - remsToPx(closeButtonDistanceFromContent);

      setPositions({
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
      });
    }
    return () => setPositions(null);
  }, [target, windowWidth, isMobile]);

  return positions;
};

export const useGetStudyToolsTarget = () => {
  const document = assertDocument();
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const studyGuides = useSelector(hasStudyGuides);

  React.useEffect(() => {
    if (studyGuides) {
      setTarget(document.querySelector('#nudge-study-tools') as HTMLElement | null);
    }
    return () => setTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyGuides]);

  return target;
};
