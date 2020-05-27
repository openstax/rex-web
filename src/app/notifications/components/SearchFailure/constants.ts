import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight
} from '../../../content/components/constants';

export const clearErrorAfter = 5000;
export const shouldAutoDismissAfter = 3000;
export const fadeOutDuration = 1000;

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + toolbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + toolbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + toolbarMobileHeight;
