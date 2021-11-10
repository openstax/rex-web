import React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
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
  toolbarIconColor,
  topbarDesktopHeight,
  topbarMobileHeight,
  verticalNavbar,
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
  ${theme.breakpoints.mobileMedium(css`
    flex-direction: row;
    justify-content: start;
    min-width: 169.817px; /* to line up menu elements */
    min-height: unset;
    margin-top: 25px;
  `)}

  ${(props: { isActive: boolean }) => props.isActive && `
    background-color: rgba(0,0,0,0.1);
  `}
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const PrintOptWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
`;

// tslint:disable-next-line:variable-name
export const PrintOptions = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

// tslint:disable-next-line:variable-name
export const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
`;

export const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
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

// tslint:disable-next-line:variable-name
export const ToolbarWrapper = styled.div`
  position: sticky;
  grid-area: navbar;
  top: ${bookBannerDesktopMiniHeight}rem;
  height: calc(100vh - 13rem);
  margin-left: -${verticalNavbar}rem;
  margin-top: -${topbarDesktopHeight}rem;
  padding: 0 10px;
  max-height: calc(100vh - 7rem);
  max-width: ${verticalNavbar}rem;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${theme.zIndex.toolbar}; /* stay above book content */
  background-color: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
    max-height: calc(100vh - 6rem);
    margin-left: -${theme.padding.page.mobile}rem;
    margin-right: ${theme.padding.page.mobile}rem;
  `)}

  ${theme.breakpoints.mobileMedium(css`
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    max-height: unset;
    max-width: 100%;
    width: 100%;
    justify-content: start;
    height: ${topbarMobileHeight}rem;
    animation: ${hideMobileMenu} .2s forwards;
    z-index: ${theme.zIndex.mobileMenu};

    ${(props: {isMobileMenuOpen: boolean}) => props.isMobileMenuOpen && css`
      animation: ${showMobileMenu} .2s forwards;
    `}
  `)}

  ${shadow}
  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
export const NudgeElementTarget = styled.div`
  display: contents;
`;

// tslint:disable-next-line: variable-name
export const ToolbarMobileHeader = styled.div`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: flex;
    width: 100%;
    height: 40px;
    justify-content: center;
    align-items: center;
    position: relaitive;
    border-bottom: 1px solid #d5d5d5;
  `)}
`;

// tslint:disable-next-line: variable-name
export const ToolbarMobileHeaderTitle = styled.span`
  font-size: 1.8rem;
  color: ${theme.color.primary.gray.base};
  font-weight: bold;
`;

// tslint:disable-next-line: variable-name
export const CloseToolbarButton = styled(PlainButton)`
  height: 40px;
  position: absolute;
  right: 0;
`;

// tslint:disable-next-line:variable-name
export const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  vertical-align: middle;
  color: ${toolbarIconColor.base};

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line: variable-name
export const LeftArrow = styled(ChevronLeft)`
  width: 4rem;
  height: 4rem;
  color: ${toolbarIconColor.base};
  margin: 0 -1rem;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;
