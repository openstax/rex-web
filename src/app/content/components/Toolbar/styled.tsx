import React from 'react';
import styled, { AnyStyledComponent, css, FlattenSimpleInterpolation, keyframes } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular';
import { Print } from 'styled-icons/fa-solid/Print';
import { maxNavWidth } from '../../../components/NavBar/styled';
import Times from '../../../components/Times';
import {
  textRegularSize,
} from '../../../components/Typography';
import theme from '../../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  toolbarIconColor,
  verticalNavbarMaxWidth,
} from '../constants';
import { disablePrint } from '../utils/disablePrint';
import { toolbarIconStyles } from './iconStyles';

export const buttonMinWidth = `45px`;

export const toolbarDefaultText = css`
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.5rem;
  ${theme.breakpoints.mobileMedium(css`
    ${textRegularSize};
    margin-left: 1.2rem;
  `)}
`;

export const barPadding = css`
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  width: calc(100% - ${theme.padding.page.desktop}rem * 2);
  ${theme.breakpoints.mobile(css`
    width: calc(100% - ${theme.padding.page.mobile}rem * 2);
  `)}
`;

export const toolbarDefaultButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 77px;
  ${(props: { isActive: boolean }) => props.isActive && `
    background-color: rgba(0,0,0,0.1);
  `}
  ${theme.breakpoints.mobileMedium(css`
    flex-direction: row;
    justify-content: start;
    min-height: unset;
    margin-top: 25px;
    background: none;
  `)}
`;

export const PlainButton = styled.button`
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  align-items: center;
  color: ${toolbarIconColor.base};
  height: 100%;
  min-width: ${buttonMinWidth};

  :hover,
  :focus {
    color: ${toolbarIconColor.darker};
  }
`;

export const PrintOptWrapper = styled(PlainButton as AnyStyledComponent)`
  ${toolbarDefaultButton};
  height: auto;
  padding: 0 10px;
`;

export const PrintOptions = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

export const PrintIcon = styled(Print as AnyStyledComponent)`
  ${toolbarIconStyles}
`;

const showMobileMenu = keyframes`
  0% {
    opacity: 0;
  }

  99% {
    opacity: 1;
  }

  100% {
    opacity: 1;
    visibility: visible;
  }
`;

const hideMobileMenu = keyframes`
  0% {
    opacity: 1;
  }

  99% {
    opacity: 0;
  }

  100% {
    opacity: 0;
    visibility: hidden;
  }
`;

export const ToolbarWrapper = styled.div<{isMobileMenuOpen: boolean}>`
  grid-area: 1 / 1 / auto / 2;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  height: calc(100vh - 13rem);
  max-height: calc(100vh - 7rem);
  max-width: ${verticalNavbarMaxWidth}rem;
  overflow: visible;
  z-index: ${theme.zIndex.toolbar}; /* stay above book content */
  background-color: ${theme.color.neutral.darker};
  border-right: 1px solid ${theme.color.neutral.formBorder};
  border-left: 1px solid ${theme.color.neutral.formBorder};

  /* hides the sidebar whens it's sliding in */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -${sidebarDesktopWidth + .1}rem; /* adding 1px prevents hiding toolbar's left border */
    width: ${sidebarDesktopWidth}rem;
    height: 100%;
    background-color: ${theme.color.neutral.darker};
  }

  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
    max-height: calc(100vh - 6rem);

    &::before {
      display: none;
    }
  `)}

  ${theme.breakpoints.mobileMedium(css`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    max-height: unset;
    max-width: 100%;
    width: 100%;
    animation: ${hideMobileMenu} .2s forwards;
    z-index: ${theme.zIndex.mobileMenu};

    ${(props: {isMobileMenuOpen: boolean}) => props.isMobileMenuOpen && css`
      animation: ${showMobileMenu} .2s forwards;
    `}
  ` as FlattenSimpleInterpolation)}

  ${disablePrint}
`;

export const ToolbarMobileHeader = styled.div`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: flex;
    width: 100%;
    height: 40px;
    justify-content: center;
    align-items: center;
    position: relaitive;
    border-bottom: 1px solid ${theme.color.neutral.formBorder};
  `)}
`;

export const ToolbarMobileHeaderTitle = styled.span`
  font-size: 1.8rem;
  color: ${theme.color.primary.gray.base};
  font-weight: bold;
`;

export const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  vertical-align: middle;
  color: ${toolbarIconColor.base};

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

export const LeftArrow = styled(ChevronLeft as AnyStyledComponent)`
  width: 4rem;
  height: 4rem;
  color: ${toolbarIconColor.base};
  margin: 0 -1rem;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

export const ToolbarElements = styled.div`
  display: flex;
  flex-direction: column;
`;
