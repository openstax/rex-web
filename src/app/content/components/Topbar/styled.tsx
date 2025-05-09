import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleLeft } from 'styled-icons/fa-solid/AngleLeft';
import { Bars as Hamburger } from 'styled-icons/fa-solid/Bars';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import SearchIcon from '../../../../assets/SearchIcon';
import Times from '../../../components/Times';
import { decoratedLinkStyle, textRegularStyle, textStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { textResizerMaxValue, textResizerMinValue } from '../../constants';
import { BookWithOSWebData } from '../../types';
import { HTMLInputElement } from '@openstax/types/lib.dom';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  contentWrapperMaxWidth,
  mobileSearchContainerMargin,
  sidebarDesktopWidth,
  sidebarTransitionTime,
  toolbarButtonWidth,
  toolbarHrHeight,
  toolbarIconColor,
  toolbarMobileSearchWrapperHeight,
  toolbarSearchInputHeight,
  toolbarSearchInputMobileHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
  verticalNavbarMaxWidth
} from '../constants';
import { contentWrapperBreakpointStyles } from '../ContentPane';
import { FilterDropdown } from '../popUp/Filters';
import { toolbarIconStyles } from '../Toolbar/iconStyles';
import { barPadding, buttonMinWidth, PlainButton } from '../Toolbar/styled';
import { applySearchIconColor } from '../utils/applySearchIconColor';
import { disablePrint } from '../utils/disablePrint';
import { isVerticalNavOpenConnector, styleWhenSidebarClosed } from '../utils/sidebar';

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
`;

export const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

// tslint:disable-next-line: variable-name
export const TopBarWrapper = styled.div`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: 100%;
  overflow: visible;
  display: block;
  z-index: ${theme.zIndex.topbar}; /* stay above book content */
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
  `)}

  ${theme.breakpoints.mobileMedium(css`
    // Make sure toolbar dropdowns float over search results
    z-index: ${theme.zIndex.sidebar + 1};
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const HamburgerIcon = styled(Hamburger)`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line: variable-name
export const MenuButton = styled((props) => {
  const intl = useIntl();

  return <PlainButton {...props} aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:open'})}>
    <HamburgerIcon />
  </PlainButton>;
})`
  display: none;
  justify-content: center;
  align-items: center;
  ${theme.breakpoints.mobileMedium(css`
    display: flex;
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchButton = styled(({ desktop, mobile, ariaLabelId, ...props }) => {
  const intl = useIntl();

  return <PlainButton
    {...props}
    {...ariaLabelId
      ? {
        'aria-label': intl.formatMessage({ id: ariaLabelId }),
      }
      : {}
    }
    value={intl.formatMessage({ id: 'i18n:search-results:bar:search-icon:value' })}
    aria-label={intl.formatMessage({ id: 'i18n:search-results:bar:search-icon:value' })}
  >
    <SearchIcon />
  </PlainButton>;
})`
    height: 3.2rem;
    border-radius: 0;
    margin: 0;
    transition: ${(props) => props.colorSchema ? 'background 200ms' : 'none'};
    background:
      ${(props: { colorSchema: BookWithOSWebData['theme'] | null }) => props.colorSchema
    ? theme.color.primary[props.colorSchema].base : 'transparent'};
    ${(props) => applySearchIconColor(props.colorSchema)}

    > svg {
      ${toolbarIconStyles}
      vertical-align: middle;
    }

    ${(props) => props.desktop && theme.breakpoints.mobileMedium(css`
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

    ${(props) => !props.formSubmitted && theme.breakpoints.mobile(css`
      display: none;
    `)}

    ${(props) => props.desktop && theme.breakpoints.mobileMedium(css`
      display: none;
    `)}
  `;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
    color: ${toolbarIconColor.base};
    height: 2.2rem;
  `;

// tslint:disable-next-line:variable-name
export const CloseButtonNew = styled.button`
    ${toolbarIconStyles}
    cursor: pointer;
    border: none;
    padding: 0;
    margin-right: 1.6rem;
    background: transparent;
    overflow: visible;
    height: 2.2rem;
    width: 2.2rem;
  `;

// tslint:disable-next-line:variable-name
export const SearchInputWrapper = styled.form`
  margin-left: auto;
  display: flex;
  align-items: center;
  margin-right: -${toolbarButtonWidth}rem;
  position: relative;
  color: ${toolbarIconColor.base};
  border: solid 0.1rem;
  border-radius: 0.2rem;
  width: 38rem;

  &:last-child { margin-right: auto; } // On desktop, center if no other controls to the right

  &:focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  &.focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  ${theme.breakpoints.mobile(css`
    height: 100%;
    overflow: hidden;
    ${(props: { active: boolean, colorSchema: BookWithOSWebData['theme'] }) => props.active && css`
      background: ${props.colorSchema ? theme.color.primary[props.colorSchema].base : 'transparent'};

      ${SearchButton} {
        ${applySearchIconColor(props.colorSchema)};
      }
    `}
  `)}
  ${theme.breakpoints.mobileMedium(css`
    width: 100%;
    &, &:last-child { margin-right: 0; }
  `)}


  ${(props: { searchInSidebar: boolean }) => props.searchInSidebar && css`
    @media screen and (min-width: ${theme.breakpoints.mobileMediumBreak}em) {
      display: none;
    }
  `}
`;

// tslint:disable-next-line:variable-name
export const SearchInput = styled(({ desktop, mobile, autoFocus, ...props }) => {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(
    () => {
      if (autoFocus) {
        ref.current?.focus();
      }
    },
    [autoFocus]
  );

  return (
    <input {...props}
      ref={ref}
      aria-label={useIntl().formatMessage({ id: 'i18n:toolbar:search:placeholder' })}
      placeholder={useIntl().formatMessage({ id: 'i18n:toolbar:search:placeholder' })}
    />
  );
})`
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

  ${(props) => props.desktop && theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchPrintWrapper = isVerticalNavOpenConnector(styled.div`
  height: ${topbarDesktopHeight}rem;
  max-width: ${contentWrapperMaxWidth}rem;
  margin: 0 auto;
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  background-color: ${theme.color.neutral.base};
  transition: padding-left ${sidebarTransitionTime}ms;
  padding-left: ${sidebarDesktopWidth}rem;
  ${contentWrapperBreakpointStyles}
  ${styleWhenSidebarClosed(css`
      padding-left: 0 !important;
  `)}
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    display: flex;
    height: ${topbarMobileHeight}rem;
    justify-content: space-between;
    padding: 0 6px;
    transition: none;
    ${SearchInputWrapper} {
      border: none;
      border-radius: 0;
      width: ${buttonMinWidth};
    }
  `)}
  ${shadow}
`);

// tslint:disable-next-line:variable-name
export const MobileSearchContainer = styled.div`
  ${barPadding}
  overflow: visible;
  margin-top: ${mobileSearchContainerMargin}rem;
  margin-bottom: ${mobileSearchContainerMargin}rem;
  height: ${toolbarSearchInputMobileHeight}rem;
  ${theme.breakpoints.mobile(css`
    display: flex;
    justify-content: center;
    align-items: center;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    justify-content: space-between;
  `)}
`;

// tslint:disable-next-line:variable-name
export const MobileSearchWrapper = styled.div`
  display: none;
  overflow: visible;
  height: ${toolbarMobileSearchWrapperHeight}rem;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    padding-left: ${verticalNavbarMaxWidth}rem;
    display: block;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    padding-left: 0;
    display: ${(props: {mobileToolbarOpen: boolean}) => props.mobileToolbarOpen ? 'block' : 'none'};
  `)}
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
export const LeftArrow = styled(AngleLeft)`
  width: 2.5rem;
  height: 2.5rem;
`;

// tslint:disable-next-line:variable-name
export const InnerText = styled.div`
  white-space: nowrap;
  margin-right: 1rem;
  text-align: left;
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
export const TextResizerDropdown = styled(FilterDropdown)`
  margin-left: auto;
  z-index: 3;

  > button {
    max-height: 5.2rem;

    > div {
      padding: 1.4rem;
    }
  }

  ${(props: {
    mobileVariant: boolean,
    mobileToolbarOpen: boolean
  }) => props.mobileVariant !== false && theme.breakpoints.mobileMedium(css`
    margin-left: 0;
    > button {
      max-height: 4.6rem;

      > div {
        padding: 0.9rem 1.5rem;
      }
    }

    display: ${props.mobileToolbarOpen ? 'none' : 'block'};
  `)}
`;

const thumbCss = css`
  background: white;
  height: 1.5rem;
  width: 0.7rem;
  border: 1px solid ${theme.color.primary.gray.base};
  border-radius: 1px;
  box-shadow:
    0 2px 1px -1px rgba(0, 0, 0, 0.04),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
`;

const tickMarkCss = css`
  background: repeating-linear-gradient(
    to right,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0) 19%,
    #fff 19%,
    #fff 20%,
    rgba(0, 0, 0, 0) 20%,
    rgba(0, 0, 0, 0) 20%
  );
`;

// tslint:disable-next-line:variable-name
export const TextResizerMenu = styled.div`
  color: ${theme.color.primary.gray.base};

  && {
    background: #fff;
    right: 0;
    left: auto;
    top: calc(100% - 1px);
  }

  text-align: left;
  font-weight: bold;

  label {
    padding: 1.6rem 1.6rem 0;
    display: block;
  }

  .controls {
    display: flex;
    align-items: center;

    > button {
      height: 4rem;
      width: 4.8rem;
    }

    input {
      -webkit-appearance: none; /* stylelint-disable property-no-vendor-prefix */
      -moz-appearance: none;
      background: #f1f1f1;
      ${(props: {bookTheme: BookWithOSWebData['theme']}) => props.bookTheme && css`
        background-image:
          linear-gradient(${theme.color.primary[props.bookTheme].base}, ${theme.color.primary[props.bookTheme].base});
      `}
      background-size:
        ${({textSize}) => `
          calc(
            (${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%
          ) 100%
        `};
      background-repeat: no-repeat;
      overflow: visible;
      height: 0.4rem;
      width: 12rem;
      margin: 0.8rem 0.7rem;
    }

    input[type="range"]::-webkit-slider-runnable-track,
    input[type="range"]::-moz-range-track {
      -webkit-appearance: none;
      -moz-appearance: none;
      box-shadow: none;
      border: none;
      height: 0.2rem;
      ${tickMarkCss}
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 0.2rem;
      ${tickMarkCss}
    }

    input[type="range"]::-moz-range-thumb {
      ${thumbCss}
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      ${thumbCss}
      width: 0.8rem;
      margin-top: -6px;
    }
  }
`;

// tslint:disable-next-line:variable-name
export const TextResizerChangeButton = styled(({ ariaLabelId, children, ...props }) => {
  const intl = useIntl();

  return <PlainButton
    {...props}
    {...ariaLabelId &&
      {
        'aria-label': intl.formatMessage({ id: ariaLabelId }),
      }
    }
  >
    {children}
  </PlainButton>;
})`
  margin: 0.2rem 0.6rem;
`;

// tslint:disable-next-line:variable-name
export const CloseSearchResultsTextButton = styled(SeachResultsTextButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;
