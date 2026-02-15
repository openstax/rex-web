import React from 'react';
import styled, { AnyStyledComponent, css, keyframes } from 'styled-components/macro';
import { ModalOverlay, Modal } from 'react-aria-components';
import Color from 'color';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import Times from '../Times';
import { h4DesktopStyle, linkHover, textRegularStyle } from '../Typography';
import { defaultFocusOutline } from '../../theme';

export const maxNavWidth = contentWrapperMaxWidth;
export const navDesktopHeight = 6.0;
export const navMobileHeight = 5.2;
const headerImageDesktopHeight = 3.5;
const headerImageMobileHeight = 2.8;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeInAnimation = css`
  animation: ${100}ms ${fadeIn} ease-out;
`;

export const TopBar = styled.div`
  overflow: visible;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${navDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  ${theme.breakpoints.mobile(css`
    height: ${navMobileHeight}rem;
  `)}
  ${disablePrint}
`;

export const HeaderImage = styled.img`
  display: block;
  width: auto;
  height: ${headerImageDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    height: ${headerImageMobileHeight}rem;
  `)}
`;

export const DropdownContainer = styled.div`
  ${fadeInAnimation}
  overflow: visible;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  ${theme.breakpoints.mobile(css`
    height: auto;
  `)}
`;

export const OverlayLogo = styled.img`
  width: auto;
  height: ${headerImageMobileHeight}rem;
  position: absolute;
  left: 1.6rem;
  top: ${(navMobileHeight - headerImageMobileHeight) / 2}rem;
`;

export const navElementStyle = css`
  display: block;
  letter-spacing: -0.072rem;
  font-size: 1.8rem;
  text-decoration: none;
  font-weight: bold;
  padding: 1rem 0;
  color: ${theme.color.primary.gray.base};

  :hover {
    color: ${theme.color.primary.gray.darker};
  }

  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    letter-spacing: 0.02rem;
    padding: 0.7rem 0;
  `)}
`;

export const Link = styled.a`
  :hover,
  :active,
  :focus {
    padding-bottom: 0.6rem;
    border-bottom: 0.4rem solid ${theme.color.primary.green.base};
  }

  ${fadeInAnimation}
  ${navElementStyle}
  ${theme.breakpoints.mobile(css`
    :hover,
    :active,
    :focus {
      padding: 0.7rem 0;
      border-bottom: none;
    }
  `)}
`;


export const OverlayHeading = styled.h4`
  ${h4DesktopStyle}
  padding-bottom: 0;
`;

export const DropdownList = styled.menu`
  margin: 0;
  padding: 0.6rem 0;
  background: none;

  > li {
    overflow: visible;
    display: block;

    a {
      overflow: visible;
      white-space: nowrap;
      display: block;
      padding: 0 1rem;
      ${textRegularStyle}
      cursor: pointer;
      text-decoration: none;

      :hover {
        color: ${linkHover};
      }

      :focus-visible {
        ${defaultFocusOutline}
      }
    }
  }
`;

export const MobileMenuOverlay = styled(ModalOverlay as AnyStyledComponent)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${Color(theme.color.neutral.base).alpha(0.98).string()};
  z-index: ${theme.zIndex.navbar + 1};
`;

export const MobileMenuModal = styled(Modal as AnyStyledComponent)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none;

  [role="dialog"] {
    outline: none;
  }
`;

export const DropdownOverlay = styled.div`
  padding-top: calc(20vh + 5vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;

  > div {
    width: min-content;
    overflow: visible;
  }
`;

export const TimesIcon = styled((
  { theme: _theme, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme?: unknown }
) =>
  <button type="button" aria-label='close menu' {...props}><Times /></button>
)`
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  position: absolute;
  height: ${navMobileHeight}rem;
  width: ${navMobileHeight}rem;
  top: 0;
  right: 0;
  color: ${theme.color.primary.gray.base};
`;

export const BarWrapper = styled.div`
  overflow: visible;
  z-index: ${theme.zIndex.navbar}; /* above book nav */
  background: ${theme.color.neutral.base};
  position: relative; /* drop shadow above notifications */
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;
