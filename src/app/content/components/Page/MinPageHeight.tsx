import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../../components/NavBar/styled';
import theme from '../../../theme';
import { desktopAttributionHeight, mobileAttributionHeight } from '../Attribution';
import {
  bookBannerDesktopBigHeight,
  bookBannerMobileBigHeight,
  toolbarWidth,
  topbarDesktopHeight,
  topbarMobileHeight,
} from '../constants';
import { isVerticalNavOpenConnector } from '../utils/sidebar';

const minDesktopContentSize =
  navDesktopHeight + bookBannerDesktopBigHeight + topbarDesktopHeight + desktopAttributionHeight;

const minMobileContentSize =
  navMobileHeight + bookBannerMobileBigHeight + topbarMobileHeight + mobileAttributionHeight;

export default isVerticalNavOpenConnector(styled.div`
  @media screen {
    padding-left: ${(props) => props.isVerticalNavOpen ? `0` : `${toolbarWidth}rem` };
    overflow: visible;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - ${minDesktopContentSize}rem);
    ${theme.breakpoints.mobile(css`
      padding-left: 0;
      min-height: calc(100vh - ${minMobileContentSize}rem);
    `)}
  }
`);
