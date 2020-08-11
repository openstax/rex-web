import theme from '../../theme';
import { BookWithOSWebData } from '../types';

export const bookBannerDesktopBigHeight = 13;
export const bookBannerDesktopMiniHeight = 7;
export const bookBannerMobileBigHeight = 10.4;
export const bookBannerMobileMiniHeight = 6;

export const scrollOffset = 3;

export const sidebarDesktopWidth = 33.5;
export const sidebarMobileWidth = 28.8;
export const sidebarTransitionTime = 300;

export const searchResultsBarDesktopWidth = 44;

export const toolbarIconColor = theme.color.primary.gray;

export const mobileSearchContainerMargin = 1;
export const toolbarSearchInputHeight = 3.2;
export const toolbarSearchInputMobileHeight = 3.2;
export const toolbarSearchInputMobileWidth = 18.5;
export const toolbarToggleSearchBarTextMobileWidth = 11.2;
export const toolbarButtonMargin = 2;
export const toolbarHrHeight = 0.1;
export const toolbarMobileSearchWrapperHeight = toolbarSearchInputMobileHeight
  + (mobileSearchContainerMargin * 2)
  + toolbarHrHeight;

export const toolbarDesktopHeight = 5;
export const toolbarMobileHeight = 4;
export const toolbarMobileExpandedHeight = toolbarMobileHeight
  + toolbarMobileSearchWrapperHeight;

export const searchSidebarTopOffset = bookBannerMobileMiniHeight
  + toolbarMobileExpandedHeight;

export const contentTextWidth = 82.5;

export const mainContentBackground = '#fff';

export const maxContentGutter = 6;
export const contentWrapperMaxWidth = contentTextWidth + sidebarDesktopWidth + maxContentGutter * 2;

export const defaultTheme = 'blue' as BookWithOSWebData['theme'];

export const bannerGradients: {[key in BookWithOSWebData['theme']]: string} = {
  'blue': '#004aa2',
  'deep-green': '#12A28C',
  'gray': '#97999b',
  'green': '#9cd14a',
  'light-blue': '#1EE1F0',
  'orange': '#FAA461',
  'red': '#E34361',
  'yellow': '#faea36',
};
