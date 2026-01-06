import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import theme from '../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarIconColor,
  topbarDesktopHeight,
  topbarMobileHeight,
} from './constants';
import { disablePrint } from './utils/disablePrint';
import { styleWhenTocClosed } from './utils/sidebar';

const sidebarPadding = 1.8;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-100%);
  box-shadow: none;
  pointer-events: none;
  visibility: hidden;
  opacity: 0;

  > * {
    opacity: 0;
  }
`;

export const SidebarPaneBody = styled.nav`
  grid-area: 1 / 2 / auto / 3;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  max-height: calc(100vh - ${bookBannerDesktopMiniHeight}rem);
  transform-origin: left;
  transition:
    transform ${sidebarTransitionTime}ms ease-in-out,
    opacity ${sidebarTransitionTime}ms ease-in-out,
    box-shadow ${sidebarTransitionTime}ms ease-in-out;
  background-color: ${theme.color.neutral.darker};
  z-index: ${theme.zIndex.sidebar};
  width: ${sidebarDesktopWidth}rem;
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    width: ${sidebarMobileWidth}rem;
    top: ${bookBannerMobileMiniHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
    max-height: calc(100vh - ${bookBannerMobileMiniHeight}rem);
  `)}

  ${theme.breakpoints.mobileMedium(css`
    z-index: ${theme.zIndex.sidebarMobileMedium};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
  `)}

  display: flex;
  flex-direction: column;

  > ol {
    -webkit-overflow-scrolling: touch;
    position: relative;
    padding: ${sidebarPadding}rem ${sidebarPadding}rem ${sidebarPadding}rem 1.6rem;
    flex: 1;

    > li:first-child {
      margin-top: 0;
    }

    ::before {
      content: "";
      background: ${theme.color.neutral.darker};
      display: block;
      height: ${sidebarPadding}rem;
      margin: -${sidebarPadding}rem -${sidebarPadding}rem 0 -${sidebarPadding}rem;
    }
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    opacity: 1;
  }

  ${styleWhenTocClosed(sidebarClosedStyle)}
  ${disablePrint}
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${topbarDesktopHeight}rem;
  padding: 0 ${sidebarPadding}rem;
  overflow: visible;
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
  box-shadow: 0 1rem 1rem -1rem rgba(0, 0, 0, 0.14);
  ${theme.breakpoints.mobile(css`
    height: ${topbarMobileHeight}rem;
  `)}
`;

export const HeaderText = styled.span`
  font-size: 1.8rem;
  line-height: 2.9rem;
  font-weight: 600;
  margin: 0;
  padding: 1rem 0;
  color: ${toolbarIconColor.base};
  flex: 1 1 0%;
  text-align: left;
  ${theme.breakpoints.mobileMedium(css`
    text-align: center;
  `)}
`;
