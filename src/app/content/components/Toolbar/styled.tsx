import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleLeft } from 'styled-icons/fa-solid/AngleLeft';
import { Print } from 'styled-icons/fa-solid/Print';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import SearchIcon from '../../../../assets/SearchIcon';
import { maxNavWidth } from '../../../components/NavBar/styled';
import {
  decoratedLinkStyle,
  textRegularSize,
  textRegularStyle,
  textStyle
} from '../../../components/Typography';
import theme from '../../../theme';
import { getBaseColors } from '../../constants';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  mobileSearchContainerMargin,
  toolbarButtonMargin,
  toolbarDesktopHeight,
  toolbarHrHeight,
  toolbarIconColor,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight,
  toolbarSearchInputHeight,
  toolbarSearchInputMobileHeight
} from '../constants';
import { OpenSidebarControl } from '../SidebarControl';
import { applySearchIconColor } from '../utils/applySearchIconColor';
import { disablePrint } from '../utils/disablePrint';
import { toolbarIconStyles } from './iconStyles';

export const buttonMinWidth = `45px`;

export const toolbarDefaultText = css`
  font-weight: 600;
  ${textRegularSize};
  margin: 0 0 0 0.5rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

const hideSearchChrome = css`
  appearance: textfield;

  ::-webkit-search-decoration,
  ::-webkit-search-cancel-button,
  ::-webkit-search-results-button,
  ::-webkit-search-results-decoration {
    appearance: none;
    display: none;
  }
`;

const closeIconStyles = css`
  height: 1.6rem;
  width: 1.6rem;
  color: #cdcdcd;
`;

const barPadding = css`
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  width: calc(100% - ${theme.padding.page.desktop}rem * 2);
  ${theme.breakpoints.mobile(css`
    width: calc(100% - ${theme.padding.page.mobile}rem * 2);
  `)}
`;

export const toolbarDefaultButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${toolbarButtonMargin}rem;
  height: auto;
  ${theme.breakpoints.mobile(css`
    margin-right: 0;
  `)}
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

// tslint:disable-next-line:variable-name
export const SearchButton = styled(({ desktop, mobile, ariaLabelId, ...props }) => {
  const intl = useIntl();

  return <PlainButton
    {...props}
    {...ariaLabelId
      ? {
        'aria-label': intl.formatMessage({id: ariaLabelId}),
      }
      : {}
    }
    value={intl.formatMessage({id: 'i18n:search-results:bar:search-icon:value'})}
  >
    <SearchIcon/>
  </PlainButton>;
})`
  height: 3.2rem;
  background: ${(props) => getBaseColors()[props.colorSchema]};
  ${applySearchIconColor}

  > svg {
    ${toolbarIconStyles}
    vertical-align: middle;
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
  ${(props) => props.mobile && css`
    display: none;
    ${theme.breakpoints.mobile(css`
      display: block;
      height: 100%;
    `)}
  `}
`;

// tslint:disable-next-line:variable-name
export const CloseButton = styled(
  ({ desktop, ...props }) => <PlainButton {...props}><TimesCircle /></PlainButton>
)`
  > svg {
    ${closeIconStyles}
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchInputWrapper = styled.form`
  display: flex;
  align-items: center;
  margin-right: 2rem;
  position: relative;
  color: ${toolbarIconColor.base};
  border: solid 0.1rem;
  border-radius: 0.2rem;
  width: 38rem;

  &:focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  &.focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  ${theme.breakpoints.mobile(css`
    margin-right: 0;
    height: 100%;
    overflow: hidden;
    width: 100%;

    ${(props: { active: boolean }) => props.active && css`
      background: ${theme.color.primary.gray.base};

      ${SearchButton} {
        color: ${applySearchIconColor};
      }
    `}
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchInput = styled(({desktop, mobile, ...props}) =>
  <input {...props}
    aria-label={useIntl().formatMessage({id: 'i18n:toolbar:search:placeholder'})}
    placeholder={useIntl().formatMessage({id: 'i18n:toolbar:search:placeholder'})}
  />)`
    ${textStyle}
    ${hideSearchChrome}
    font-size: 1.6rem;
    margin: 0 1rem 0 1rem;
    height: ${toolbarSearchInputHeight}rem;
    border: none;
    outline: none;
    width: 100%;
    appearance: textfield;

    ::placeholder {
      color: ${theme.color.text.label};
    }

    ${(props) => props.desktop && theme.breakpoints.mobile(css`
      display: none;
    `)}
  `;

// tslint:disable-next-line:variable-name
export const SearchPrintWrapper = styled.div`
  height: 100%;
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: 100%;
    ${SearchInputWrapper} {
      border: none;
      border-radius: 0;
      width: ${buttonMinWidth};
    }
  `)}
`;

const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

// tslint:disable-next-line:variable-name
export const BarWrapper = styled.div`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: 100%;
  overflow: visible;
  display: block;
  z-index: ${theme.zIndex.toolbar}; /* stay above book content */
  background-color: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
  `)}

  ${shadow}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const Hr = styled.hr`
  border: none;
  border-top: ${toolbarHrHeight}rem solid #efeff1;
  display: none;
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
export const TopBar = styled.div`
  display: flex;
  overflow: visible;
  justify-content: flex-end;
  align-items: center;
  ${barPadding};
  height: ${toolbarDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    justify-content: space-between;
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const MobileSearchContainer = styled.div`
  ${barPadding}
  margin-top: ${mobileSearchContainerMargin}rem;
  margin-bottom: ${mobileSearchContainerMargin}rem;
  height: ${toolbarSearchInputMobileHeight}rem;
  ${theme.breakpoints.mobile(css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `)}
`;

// tslint:disable-next-line:variable-name
export const MobileSearchWrapper = styled.div`
  display: none;
  height: ${toolbarMobileSearchWrapperHeight}rem;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LeftArrow = styled(AngleLeft)`
  width: 2.5rem;
  height: 2.5rem;
`;

// tslint:disable-next-line:variable-name
export const SeachResultsTextButton = styled(PlainButton)`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  display: flex;
  overflow: visible;
  min-width: auto;
`;

// tslint:disable-next-line:variable-name
export const InnerText = styled.div`
  white-space: nowrap;
  margin-right: 1rem;
  text-align: left;
`;

// tslint:disable-next-line:variable-name
export const SidebarControl = styled(OpenSidebarControl)`
  order: -1;
  margin-right: auto;
  ${theme.breakpoints.mobile(css`
    margin-right: unset;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeElementTarget = styled.div`
  display: contents;
`;
