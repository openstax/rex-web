import React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import { maxNavWidth } from '../../../components/NavBar/constants';
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

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * ChevronLeft icon for Toolbar component.
 * SVG path from Boxicons (https://boxicons.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function ChevronLeftIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"
      />
    </svg>
  );
}

export const ChevronLeftIcon = styled(ChevronLeftIconBase)``;

/**
 * Print icon for Toolbar component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function PrintIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M448 192V77.25c0-8.49-3.37-16.62-9.37-22.63L393.37 9.37c-6-6-14.14-9.37-22.63-9.37H96C78.33 0 64 14.33 64 32v160c-35.35 0-64 28.65-64 64v112c0 8.84 7.16 16 16 16h48v96c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32v-96h48c8.84 0 16-7.16 16-16V256c0-35.35-28.65-64-64-64zm-64 256H128v-96h256v96zm0-224H128V64h192v48c0 8.84 7.16 16 16 16h48v96zm48 72c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"
      />
    </svg>
  );
}

export const PrintIconComponent = styled(PrintIconBase)``;

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

export const PrintOptWrapper = styled(PlainButton)`
  ${toolbarDefaultButton};
  height: auto;
  padding: 0 10px;
`;

export const PrintOptions = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

export const PrintIcon = styled(PrintIconComponent)`
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

export const ToolbarWrapper = styled.div`
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
  `)}

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

export const LeftArrow = styled(ChevronLeftIcon)`
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
