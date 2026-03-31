import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
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
  sidebarTransitionTime,
  toolbarHrHeight,
  toolbarIconColor,
  toolbarMobileSearchWrapperHeight,
  toolbarSearchInputHeight,
  toolbarSearchInputMobileHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
} from '../constants';
import { FilterDropdown } from '../popUp/Filters';
import { toolbarIconStyles } from '../Toolbar/iconStyles';
import { barPadding, buttonMinWidth, PlainButton } from '../Toolbar/styled';
import { applySearchIconColor } from '../utils/applySearchIconColor';
import { disablePrint } from '../utils/disablePrint';
import { isVerticalNavOpenConnector, styleWhenSidebarClosed } from '../utils/sidebar';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * AngleLeft icon for Topbar component.
 * SVG path from Font Awesome (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function AngleLeftIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 256 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"
      />
    </svg>
  );
}

export const AngleLeftIcon = styled(AngleLeftIconBase)``;

/**
 * Hamburger icon for Topbar component.
 * SVG path from Font Awesome (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function HamburgerIconComponentBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
      />
    </svg>
  );
}

const HamburgerIconComponent = styled(HamburgerIconComponentBase)``;

/**
 * TimesCircle icon for Topbar component.
 * SVG path from Font Awesome (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function TimesCircleIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
      />
    </svg>
  );
}

const TimesCircleIcon = styled(TimesCircleIconBase)``;

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

export const HamburgerIcon = styled(HamburgerIconComponent)`
  ${toolbarIconStyles}
`;

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

export const CloseButton = styled(
  ({ desktop, ...props }) => <PlainButton {...props}><TimesCircleIcon /></PlainButton>
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

export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
    color: ${toolbarIconColor.base};
    height: 2.2rem;
  `;

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

export const SearchInputWrapper = styled.form`
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
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

export const MobileSearchWrapper = styled.div`
  display: none;
  overflow: visible;
  height: ${toolbarMobileSearchWrapperHeight}rem;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    padding-left: 0;
    display: ${(props: {mobileToolbarOpen: boolean}) => props.mobileToolbarOpen ? 'block' : 'none'};
  `)}
`;

export const Hr = styled.hr`
  border: none;
  border-top: ${toolbarHrHeight}rem solid #efeff1;
  display: none;
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

export const LeftArrow = styled(AngleLeftIcon)`
  width: 2.5rem;
  height: 2.5rem;
`;

export const InnerText = styled.div`
  white-space: nowrap;
  margin-right: 1rem;
  text-align: left;
`;

export const SeachResultsTextButton = styled(PlainButton)`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  display: flex;
  overflow: visible;
  min-width: auto;
`;

export const TextResizerDropdown = styled(FilterDropdown)`
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

export const TextResizerMenu = styled.div`
  color: ${theme.color.primary.gray.base};
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
      ${(props: {bookTheme: BookWithOSWebData['theme']}) => props.bookTheme ? css`
        background:
          linear-gradient(
            to right,
            ${theme.color.primary[props.bookTheme].base}
              ${({textSize}: {textSize: number}) => `
                calc(
                  (${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%
                )
              `},
              ${theme.color.primary.gray.medium}
              ${({textSize}: {textSize: number}) => `
                calc(
                  (${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%
                )
              `}
          );
      ` : css`
        background: ${theme.color.primary.gray.medium};
      `}
      overflow: visible;
      height: 0.4rem;
      width: 12rem;
      margin: 0.8rem 0.7rem;
      cursor: pointer;
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

export const CloseSearchResultsTextButton = styled(SeachResultsTextButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;
