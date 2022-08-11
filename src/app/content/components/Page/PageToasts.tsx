import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  contentWrapperMaxWidth,
  contentWrapperMaxWidthInEm,
  contentWrapperMaxWidthWithNavbarInEm,
  toolbarMobileSearchWrapperHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
  verticalNavbarMaxWidth,
} from '../../../content/components/constants';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { groupedToastNotifications } from '../../../notifications/selectors';
import theme from '../../../theme';
import { mobileToolbarOpen as mobileToolbarOpenSelector } from '../../search/selectors';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + topbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + topbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + topbarMobileHeight;

// tslint:disable-next-line:variable-name
export const ToastContainerWrapper = styled.div`
  position: sticky;
  overflow: visible;
  z-index: ${theme.zIndex.contentNotifications - 1};
  top: ${desktopSearchFailureTop}rem;

  @media screen and (max-width: ${contentWrapperMaxWidthWithNavbarInEm}) {
    max-width: calc(100vw - ((100vw - ${contentWrapperMaxWidth}rem) / 2) - ${verticalNavbarMaxWidth}rem);
    left: calc(100vw - (100vw - ((100vw - ${contentWrapperMaxWidth}rem) / 2) - ${verticalNavbarMaxWidth}rem));
  }

  @media screen and (max-width: ${contentWrapperMaxWidthInEm}) {
    max-width: calc(100vw - ${verticalNavbarMaxWidth}rem);
    left: ${verticalNavbarMaxWidth}rem;
  }

  ${theme.breakpoints.mobile(css`
    max-width: 100%;
    left: 0;
    z-index: ${theme.zIndex.contentNotifications + 1};
    top: ${getMobileSearchFailureTop}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const PageToasts = () => {
  const toasts = useSelector(groupedToastNotifications).page;
  const mobileToolbarOpen = useSelector(mobileToolbarOpenSelector);

  return toasts ? <ToastContainerWrapper mobileToolbarOpen={mobileToolbarOpen}>
    <ToastNotifications toasts={toasts} />
  </ToastContainerWrapper> : null;
};

export default PageToasts;
