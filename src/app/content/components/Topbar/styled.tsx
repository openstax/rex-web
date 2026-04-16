import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import classNames from 'classnames';
import SearchIcon from '../../../../assets/SearchIcon';
import Times from '../../../components/Times';
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
import { buttonMinWidth, PlainButton as PlainButtonBase } from '../Toolbar/styled';
import { isVerticalNavOpenConnector } from '../utils/sidebar';
import Color from 'color';
import './Topbar.css';

/**
 * Shadow style for Topbar wrapper
 * Used by AssignedTopBar component
 */
export const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

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

// Filter out theme prop before spreading to DOM
function PlainButton({
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;
  return <PlainButtonBase {...domProps} className={className} style={style} />;
}

export const TopBarWrapper = function TopBarWrapper({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;
  return (
    <div
      {...domProps}
      className={classNames('topbar-wrapper', className)}
      style={
        {
          '--topbar-sticky-top-desktop': `${bookBannerDesktopMiniHeight}rem`,
          '--topbar-sticky-top-mobile': `${bookBannerMobileMiniHeight}rem`,
          '--topbar-z-index': theme.zIndex.topbar,
          '--topbar-z-index-mobile-medium': theme.zIndex.sidebar + 1,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const HamburgerIcon = styled(HamburgerIconComponent)`
  ${toolbarIconStyles}
`;

export const MenuButton = function MenuButton({
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme?: unknown }) {
  const intl = useIntl();
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <PlainButton
      {...domProps}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:open' })}
      className={classNames('topbar-menu-button', className)}
      style={style}
    >
      <HamburgerIcon />
    </PlainButton>
  );
};

export const SearchButton = function SearchButton({
  desktop,
  mobile,
  ariaLabelId,
  colorSchema,
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  desktop?: boolean;
  mobile?: boolean;
  ariaLabelId?: string;
  colorSchema: BookWithOSWebData['theme'] | null;
  theme?: unknown;
}) {
  const intl = useIntl();
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  // Compute search icon color
  const searchIconColor = colorSchema
    ? Color(theme.color.primary[colorSchema].base).isDark()
      ? theme.color.text.white
      : theme.color.primary[colorSchema].foreground
    : toolbarIconColor.base;

  return (
    <PlainButton
      {...domProps}
      value={intl.formatMessage({
        id: 'i18n:search-results:bar:search-icon:value',
      })}
      aria-label={intl.formatMessage({
        id: ariaLabelId || 'i18n:search-results:bar:search-icon:value',
      })}
      className={classNames(
        'topbar-search-button',
        { desktop, mobile },
        className
      )}
      style={
        {
          '--search-button-bg-color': colorSchema
            ? theme.color.primary[colorSchema].base
            : 'transparent',
          '--search-button-transition': colorSchema
            ? 'background 200ms'
            : 'none',
          '--search-icon-color': searchIconColor,
          ...style,
        } as React.CSSProperties
      }
    >
      <SearchIcon />
    </PlainButton>
  );
};

export const CloseButton = function CloseButton({
  desktop,
  formSubmitted,
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  desktop?: boolean;
  formSubmitted?: boolean;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <PlainButton
      {...domProps}
      className={classNames(
        'topbar-close-button',
        { desktop, 'form-submitted': formSubmitted },
        className
      )}
      style={style}
    >
      <TimesCircleIcon />
    </PlainButton>
  );
};

export const CloseIcon = function CloseIcon({
  className,
  style,
  ...props
}: React.SVGAttributes<SVGSVGElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <Times
      {...domProps}
      aria-hidden="true"
      className={classNames('topbar-close-icon', className)}
      style={
        {
          '--toolbar-icon-color': toolbarIconColor.base,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const CloseButtonNew = function CloseButtonNew({
  desktop,
  formSubmitted,
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  desktop?: boolean;
  formSubmitted?: boolean;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps} = props as Record<string, unknown>;

  return (
    <button
      {...domProps}
      className={classNames(
        'topbar-close-button-new',
        { desktop, 'form-submitted': formSubmitted },
        className
      )}
      style={style}
    />
  );
};

export const SearchInputWrapper = function SearchInputWrapper({
  active,
  colorSchema,
  searchInSidebar,
  className,
  style,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement> & {
  active?: boolean;
  colorSchema: BookWithOSWebData["theme"] | null;
  searchInSidebar?: boolean;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  // Compute search icon color for active state
  const searchIconColor = colorSchema
    ? Color(theme.color.primary[colorSchema].base).isDark()
      ? theme.color.text.white
      : theme.color.primary[colorSchema].foreground
    : toolbarIconColor.base;

  return (
    <form
      {...domProps}
      className={classNames(
        'topbar-search-input-wrapper',
        { active, 'search-in-sidebar': searchInSidebar },
        className
      )}
      style={
        {
          '--toolbar-icon-color': toolbarIconColor.base,
          '--light-blue-color': theme.color.secondary.lightBlue.base,
          '--search-button-bg-color': colorSchema
            ? theme.color.primary[colorSchema].base
            : 'transparent',
          '--search-icon-color': searchIconColor,
          '--button-min-width': buttonMinWidth,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const SearchInput = function SearchInput({
  desktop,
  mobile,
  autoFocus,
  className,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  desktop?: boolean;
  mobile?: boolean;
  autoFocus?: boolean;
  theme?: unknown;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const intl = useIntl();
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  React.useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus]);

  return (
    <input
      {...domProps}
      ref={ref}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:search:placeholder' })}
      placeholder={intl.formatMessage({
        id: 'i18n:toolbar:search:placeholder',
      })}
      className={classNames('topbar-search-input', { desktop }, className)}
      style={
        {
          '--toolbar-search-input-height': `${toolbarSearchInputHeight}rem`,
          '--text-label-color': theme.color.text.label,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const SearchPrintWrapper = isVerticalNavOpenConnector(
  function SearchPrintWrapper({
    isVerticalNavOpen,
    className,
    style,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    isVerticalNavOpen?: boolean;
    theme?: unknown;
  }) {
    const { theme: _theme, ...domProps } = props as Record<string, unknown>;

    return (
      <div
        {...domProps}
        className={classNames(
          'topbar-search-print-wrapper',
          { 'sidebar-closed': !isVerticalNavOpen },
          className
        )}
        style={
          {
            '--topbar-desktop-height': `${topbarDesktopHeight}rem`,
            '--content-wrapper-max-width': `${contentWrapperMaxWidth}rem`,
            '--neutral-color': theme.color.neutral.base,
            '--sidebar-transition-time': `${sidebarTransitionTime}ms`,
            '--topbar-mobile-height': `${topbarMobileHeight}rem`,
            '--button-min-width': buttonMinWidth,
            ...style,
          } as React.CSSProperties
        }
      />
    );
  }
);

export const MobileSearchContainer = function MobileSearchContainer({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div
      {...domProps}
      className={classNames('topbar-mobile-search-container', className)}
      style={
        {
          '--mobile-search-container-margin': `${mobileSearchContainerMargin}rem`,
          '--toolbar-search-input-mobile-height': `${toolbarSearchInputMobileHeight}rem`,
          '--max-nav-width': '120rem', // maxNavWidth from NavBar/styled
          '--page-padding-desktop': `${theme.padding.page.desktop}rem`,
          '--page-padding-mobile': `${theme.padding.page.mobile}rem`,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const MobileSearchWrapper = function MobileSearchWrapper({
  mobileToolbarOpen,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  mobileToolbarOpen: boolean;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div
      {...domProps}
      className={classNames(
        'topbar-mobile-search-wrapper',
        { 'mobile-toolbar-open': mobileToolbarOpen },
        className
      )}
      style={
        {
          '--toolbar-mobile-search-wrapper-height': `${toolbarMobileSearchWrapperHeight}rem`,
          '--neutral-color': theme.color.neutral.base,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const Hr = function Hr({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLHRElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <hr
      {...domProps}
      className={classNames('topbar-hr', className)}
      style={
        {
          '--toolbar-hr-height': `${toolbarHrHeight}rem`,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const LeftArrow = styled(AngleLeftIcon)`
  width: 2.5rem;
  height: 2.5rem;
`;

export const InnerText = function InnerText({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <div {...domProps} className={classNames('topbar-inner-text', className)} />
  );
};

export const SearchResultsTextButton = function SearchResultsTextButton({
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme?: unknown }) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <PlainButton
      {...domProps}
      className={classNames('topbar-search-results-text-button', className)}
      style={style}
    />
  );
};

export const TextResizerDropdown = function TextResizerDropdown({
  mobileVariant,
  mobileToolbarOpen,
  className,
  ...props
}: React.ComponentProps<typeof FilterDropdown> & {
  mobileVariant?: boolean;
  mobileToolbarOpen?: boolean;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps } = props;

  return (
    <FilterDropdown
      {...domProps}
      className={classNames(
        'topbar-text-resizer-dropdown',
        {
          'mobile-variant': mobileVariant !== false,
          'mobile-toolbar-closed':
            mobileVariant !== false && !mobileToolbarOpen,
          'mobile-toolbar-open': mobileVariant !== false && mobileToolbarOpen,
        },
        className
      )}
    />
  );
};

export const TextResizerMenu = function TextResizerMenu({
  bookTheme,
  textSize,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  bookTheme: BookWithOSWebData["theme"];
  textSize: number;
  theme?: unknown;
}) {
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  // Compute text resizer gradient
  const textResizerGradient = bookTheme
    ? `linear-gradient(
        to right,
        ${theme.color.primary[bookTheme].base}
          calc((${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%),
          ${theme.color.primary.gray.medium}
          calc((${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%)
      )`
    : undefined;

  return (
    <div
      {...domProps}
      className={classNames('topbar-text-resizer-menu', className)}
      style={
        {
          '--primary-gray-color': theme.color.primary.gray.base,
          '--text-resizer-gradient': textResizerGradient,
          '--primary-gray-medium-color': theme.color.primary.gray.medium,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export const TextResizerChangeButton = function TextResizerChangeButton({
  ariaLabelId,
  children,
  className,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabelId?: string;
  theme?: unknown;
}) {
  const intl = useIntl();
  const { theme: _theme, ...domProps } = props as Record<string, unknown>;

  return (
    <PlainButton
      {...domProps}
      {...(ariaLabelId && {
        'aria-label': intl.formatMessage({ id: ariaLabelId }),
      })}
      className={classNames('topbar-text-resizer-change-button', className)}
      style={style}
    >
      {children}
    </PlainButton>
  );
};

export const CloseSearchResultsTextButton =
  function CloseSearchResultsTextButton({
    className,
    style,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme?: unknown }) {
    const { theme: _theme, ...domProps } = props as Record<string, unknown>;

    return (
      <SearchResultsTextButton
        {...domProps}
        className={classNames(
          'topbar-close-search-results-text-button',
          className
        )}
        style={style}
      />
    );
  };
