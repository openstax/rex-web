import React from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../../../components/NavBar';
import theme from '../../../../theme';
import { closeMobileMenu, closeToc } from '../../../actions';
import { State } from '../../../types';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarIconColor,
  topbarDesktopHeight,
  topbarMobileHeight
} from '../../constants';
import { TimesIcon } from '../../Toolbar/styled';
import { disablePrint } from '../../utils/disablePrint';
import { styleWhenSidebarClosed } from '../../utils/sidebar';

const sidebarPadding = 1.8;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-${sidebarDesktopWidth}rem);
  box-shadow: none;
  pointer-events: none;
  visibility: hidden;
  opacity: 0;

  > * {
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const SidebarBody = styled.div<{isTocOpen: State['tocOpen']}>`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  margin-top: -${topbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  max-height: calc(100vh - ${bookBannerDesktopMiniHeight}rem);
  transition:
    transform ${sidebarTransitionTime}ms ease-in-out,
    opacity ${sidebarTransitionTime}ms ease-in-out,
    box-shadow ${sidebarTransitionTime}ms ease-in-out;
  background-color: ${theme.color.neutral.darker};
  z-index: ${theme.zIndex.sidebar};
  margin-left: -50vw;
  padding-left: 50vw;
  width: calc(50vw + ${sidebarDesktopWidth}rem);
  min-width: calc(50vw + ${sidebarDesktopWidth}rem);
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${sidebarMobileWidth}rem);
    min-width: calc(50vw + ${sidebarMobileWidth}rem);
    top: ${bookBannerMobileMiniHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
    max-height: calc(100vh - ${bookBannerMobileMiniHeight}rem);
  `)}

  ${theme.breakpoints.mobileMedium(css`
    z-index: ${theme.zIndex.highlightSummaryPopup};
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

  ${styleWhenSidebarClosed(sidebarClosedStyle)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${topbarDesktopHeight}rem;
  padding: 0 ${sidebarPadding}rem;
  overflow: visible;
  box-shadow: 0 1rem 1rem -1rem rgba(0, 0, 0, 0.14);
  ${theme.breakpoints.mobile(css`
    height: ${topbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const ToCHeaderText = styled.span`
  font-size: 1.8rem;
  line-height: 2.9rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
  color: ${toolbarIconColor.base};
  flex: 1 1 0%;
  text-align: left;
  ${theme.breakpoints.mobileMedium(css`
    text-align: center;
  `)}
`;

// tslint:disable-next-line: variable-name
export const CloseToCAndMobileMenuButton = styled((props) => {
  const dispatch = useDispatch();
  return <button
    onClick={() => {
      dispatch(closeToc());
      dispatch(closeMobileMenu());
    }}
    {...props}
  ><TimesIcon /></button>;
})`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;
