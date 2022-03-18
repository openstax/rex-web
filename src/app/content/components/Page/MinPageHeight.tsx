import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../../components/NavBar/styled';
import theme from '../../../theme';
import { desktopAttributionHeight, mobileAttributionHeight } from '../Attribution';
import {
  bookBannerDesktopBigHeight,
  bookBannerMobileBigHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
} from '../constants';

const minDesktopContentSize =
  navDesktopHeight + bookBannerDesktopBigHeight + topbarDesktopHeight + desktopAttributionHeight;

const minMobileContentSize =
  navMobileHeight + bookBannerMobileBigHeight + topbarMobileHeight + mobileAttributionHeight;

export default styled.div`
  @media screen {
    width: 100%;
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
