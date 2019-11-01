import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../../components/NavBar/styled';
import theme from '../../../theme';
import { desktopAttributionHeight, mobileAttributionHeight } from '../Attribution';
import {
  bookBannerDesktopBigHeight,
  bookBannerMobileBigHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight
} from '../constants';

const minDesktopContentSize =
  navDesktopHeight + bookBannerDesktopBigHeight + toolbarDesktopHeight + desktopAttributionHeight;

const minMobileContentSize =
  navMobileHeight + bookBannerMobileBigHeight + toolbarMobileHeight + mobileAttributionHeight;

export default styled.div`
  @media screen {
    overflow: visible;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - ${minDesktopContentSize}rem);
    ${theme.breakpoints.mobile(css`
      min-height: calc(100vh - ${minMobileContentSize}rem);
    `)}
  }
`;
