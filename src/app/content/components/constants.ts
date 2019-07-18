import theme from '../../theme';

export const bookBannerDesktopBigHeight = 13;
export const bookBannerDesktopMiniHeight = 7;
export const bookBannerMobileBigHeight = 10.4;
export const bookBannerMobileMiniHeight = 6;

export const sidebarDesktopWidth = 33.5;
export const sidebarMobileWidth = 28.8;
export const sidebarTransitionTime = 300;

export const searchResultsBarDesktopWidth = 43.5;
export const searchResultsBarMobileWidth = 100;

export const toolbarIconColor = theme.color.primary.gray;
export const toolbarDesktopHeight = 5;
export const toolbarMobileHeight = 4;

export const mobileSearchContainerMargin = 1;
export const toolbarSearchInputDesktopHeight = 3.2;
export const toolbarSearchInputMobileHeight = 3.2;
export const toolbarSearchInputMobileWidth = 18.5;
export const toolbarToggleSearchBarTextMobileWidth = 11.2;
export const toolbarMobileSearchWrapperHeight = toolbarSearchInputMobileHeight
+ (mobileSearchContainerMargin * 2) + 0.1;
export const toolbarMobileElementsHeight = bookBannerMobileMiniHeight
+ toolbarMobileHeight
+ toolbarMobileSearchWrapperHeight;

export const contentTextWidth = 82.5;

export const mainContentBackground = '#fff';

export const maxContentGutter = 6;
export const contentWrapperMaxWidth = contentTextWidth + sidebarDesktopWidth + maxContentGutter * 2;
