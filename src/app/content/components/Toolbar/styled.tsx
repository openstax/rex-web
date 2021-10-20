import styled, { css } from 'styled-components/macro';
import { Print } from 'styled-icons/fa-solid/Print';
import { maxNavWidth } from '../../../components/NavBar/styled';
import {
  textRegularSize,
} from '../../../components/Typography';
import theme from '../../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarIconColor,
  toolbarMobileHeight,
  topbarHeight,
  verticalNavbar,
} from '../constants';
import { disablePrint } from '../utils/disablePrint';
import { toolbarIconStyles } from './iconStyles';

export const buttonMinWidth = `45px`;

export const toolbarDefaultText = css`
  font-weight: 600;
  ${textRegularSize};
  ${theme.breakpoints.mobile(css`
    display: none;
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
  height: auto;
  margin: 12px 10px;
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
`;

// tslint:disable-next-line:variable-name
export const PrintOptions = styled.span`
  ${toolbarDefaultText}
`;

// tslint:disable-next-line:variable-name
export const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
`;

export const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

// tslint:disable-next-line:variable-name
export const ToolbarWrapper = styled.div`
  position: sticky;
  grid-area: navbar;
  top: ${bookBannerDesktopMiniHeight}rem;
  height: calc(100vh - 13rem);
  margin-left: calc(-${verticalNavbar}rem / 2);
  margin-top: -${topbarHeight}rem;
  max-height: calc(100vh - 7rem);
  max-width: ${verticalNavbar}rem;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${theme.zIndex.toolbar}; /* stay above book content */
  background-color: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
    justify-content: space-between;
    height: ${toolbarMobileHeight}rem;
  `)}

  ${shadow}
  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
export const NudgeElementTarget = styled.div`
  display: contents;
`;
