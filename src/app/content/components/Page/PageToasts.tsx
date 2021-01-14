import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components/macro';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight
} from '../../../content/components/constants';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { groupedToastNotifications } from '../../../notifications/selectors';
import theme from '../../../theme';
import { mobileToolbarOpen as mobileToolbarOpenSelector } from '../../search/selectors';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + toolbarDesktopHeight;
export const getMobileSearchFailureTop = (mobileToolbarOpen: boolean) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + toolbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + toolbarMobileHeight;

// tslint:disable-next-line:variable-name
export const ToastContainerWrapper = styled.div<{mobileToolbarOpen: boolean}>`
  width: 100%;
  position: sticky;
  overflow: visible;
  z-index: ${theme.zIndex.contentNotifications - 1};
  top: ${desktopSearchFailureTop}rem;
  ${theme.breakpoints.mobile(css`
    z-index: ${theme.zIndex.contentNotifications + 1};
    top: ${(props: {mobileToolbarOpen: boolean }) => getMobileSearchFailureTop(props.mobileToolbarOpen)}rem;
  ` as FlattenSimpleInterpolation)}
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
