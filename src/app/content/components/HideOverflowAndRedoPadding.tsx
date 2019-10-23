import styled, { css } from 'styled-components/macro';
import { wrapperPadding } from '../../components/Layout';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar/styled';
import theme from '../../theme';
import { desktopAttributionHeight, mobileAttributionHeight } from './Attribution';
import {
  bookBannerDesktopBigHeight,
  bookBannerMobileBigHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight
} from './constants';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

/*
 * you want to hide overflow and redo padding in the same place so that the
 * scrollbar doesn't have padding on the sides
 */

const minDesktopContentSize =
  navDesktopHeight + bookBannerDesktopBigHeight + toolbarDesktopHeight + desktopAttributionHeight;

const minMobileContentSize =
  navMobileHeight + bookBannerMobileBigHeight + toolbarMobileHeight + mobileAttributionHeight;

// tslint:disable-next-line:variable-name
const HideOverflowAndRedoPadding = isOpenConnector(styled.div`
  @media screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - ${minDesktopContentSize}rem);
    ${theme.breakpoints.mobile(css`
      min-height: calc(100vh - ${minMobileContentSize}rem);
    `)}
    ${wrapperPadding}
    ${styleWhenSidebarClosed(css`
      ${wrapperPadding}
    `)}
  }
`);

export default HideOverflowAndRedoPadding;
