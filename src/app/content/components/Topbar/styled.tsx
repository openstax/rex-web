import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import classNames from 'classnames';
import SearchIcon from '../../../../assets/SearchIcon';
import Times from '../../../components/Times';
import { textRegularStyle, decoratedLinkStyle, textStyle } from '../../../components/Typography';
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
import { barPadding, buttonMinWidth, PlainButton } from '../Toolbar/Toolbar.legacy';
import { disablePrintClass } from '../utils/disablePrint';
import { isVerticalNavOpenConnector } from '../utils/sidebar';
import './Topbar.css';

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

interface TopBarWrapperProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function TopBarWrapper(
  { children, className, style, ...props }: TopBarWrapperProps & React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      className={classNames('topbar-wrapper', 'TopBarWrapper', 'topbar-shadow', disablePrintClass, className)}
      style={{
        '--topbar-top-desktop': `${bookBannerDesktopMiniHeight}rem`,
        '--topbar-top-mobile': `${bookBannerMobileMiniHeight}rem`,
        '--topbar-z-index': theme.zIndex.topbar,
        '--topbar-z-index-mobile': theme.zIndex.sidebar + 1,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export const HamburgerIcon = styled(HamburgerIconComponent)`
  ${toolbarIconStyles}
`;

interface MenuButtonProps {
  type?: 'button';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function MenuButton(props: MenuButtonProps) {
  const intl = useIntl();

  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  return (
    <PlainButton
      {...safeProps}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:open' })}
      className="topbar-menu-button"
    >
      <HamburgerIcon />
    </PlainButton>
  );
}

interface SearchButtonProps {
  desktop?: boolean;
  mobile?: boolean;
  ariaLabelId?: string;
  colorSchema?: BookWithOSWebData['theme'] | null;
  type?: 'button';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SearchButton(
  { desktop, mobile, ariaLabelId, colorSchema, className, style, ...props }: SearchButtonProps
) {
  const intl = useIntl();

  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  // Get search icon color from theme
  const iconColor = colorSchema ? theme.color.primary[colorSchema].foreground : toolbarIconColor.base;

  return (
    <PlainButton
      {...safeProps}
      {...(ariaLabelId
        ? {
            'aria-label': intl.formatMessage({ id: ariaLabelId }),
          }
        : {})}
      value={intl.formatMessage({ id: 'i18n:search-results:bar:search-icon:value' })}
      aria-label={intl.formatMessage({ id: 'i18n:search-results:bar:search-icon:value' })}
      className={classNames(
        'topbar-search-button',
        {
          'topbar-search-button--desktop': desktop,
          'topbar-search-button--mobile': mobile,
        },
        className
      )}
      style={{
        '--search-button-transition': colorSchema ? 'background 200ms' : 'none',
        '--search-button-bg': colorSchema ? theme.color.primary[colorSchema].base : 'transparent',
        '--search-icon-color': iconColor,
        ...style,
      } as React.CSSProperties}
    >
      <SearchIcon style={{ color: iconColor }} />
    </PlainButton>
  );
}

interface CloseButtonProps {
  desktop?: boolean;
  formSubmitted?: boolean;
  type?: 'button';
  onClick?: (e: React.FormEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CloseButton({ desktop, formSubmitted, className, style, ...props }: CloseButtonProps) {
  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  return (
    <PlainButton
      {...safeProps}
      className={classNames(
        'topbar-close-button',
        {
          'topbar-close-button--desktop': desktop,
          'topbar-close-button--not-submitted': !formSubmitted,
        },
        className
      )}
      style={style}
    >
      <TimesCircleIcon />
    </PlainButton>
  );
}

export function CloseIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return <Times {...props} aria-hidden="true" className="topbar-close-icon-times" />;
}

interface CloseButtonNewProps {
  desktop?: boolean;
  formSubmitted?: boolean;
  type?: 'button';
  onClick?: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CloseButtonNew({ children, className, style, ...props }: CloseButtonNewProps) {
  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  return (
    <button
      {...safeProps}
      className={classNames('topbar-close-button-new', className)}
      style={{
        ...toolbarIconStyles,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

interface SearchInputWrapperProps {
  active?: boolean;
  colorSchema?: BookWithOSWebData['theme'] | null;
  searchInSidebar?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  action?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SearchInputWrapper({
  active,
  colorSchema,
  searchInSidebar,
  children,
  className,
  style,
  ...props
}: SearchInputWrapperProps & React.FormHTMLAttributes<HTMLFormElement>) {
  // Get search icon color for active state
  const iconColor = colorSchema && active ? theme.color.primary[colorSchema].foreground : toolbarIconColor.base;

  return (
    <form
      {...props}
      className={classNames(
        'topbar-search-input-wrapper',
        'SearchInputWrapper',
        {
          'topbar-search-input-wrapper--active': active,
          'topbar-search-input-wrapper--search-in-sidebar': searchInSidebar,
        },
        className
      )}
      style={{
        '--toolbar-icon-color': toolbarIconColor.base,
        '--focus-border-color': theme.color.secondary.lightBlue.base,
        '--search-button-bg': colorSchema && active ? theme.color.primary[colorSchema].base : 'transparent',
        '--search-icon-color': iconColor,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </form>
  );
}

interface SearchInputProps {
  desktop?: boolean;
  mobile?: boolean;
  autoFocus?: boolean;
  type?: string;
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SearchInput({ desktop, mobile, autoFocus, className, style, ...props }: SearchInputProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const intl = useIntl();

  React.useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus]);

  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  return (
    <input
      {...safeProps}
      ref={ref}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:search:placeholder' })}
      placeholder={intl.formatMessage({ id: 'i18n:toolbar:search:placeholder' })}
      className={classNames(
        'topbar-search-input-field',
        'topbar-search-input',
        {
          'topbar-search-input-field--desktop': desktop,
        },
        className
      )}
      style={{
        '--search-input-height': `${toolbarSearchInputHeight}rem`,
        '--placeholder-color': theme.color.text.label,
        '--text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface SearchPrintWrapperProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  verticalNavOpen?: boolean;
}

// Using the isVerticalNavOpenConnector HOC pattern
export const SearchPrintWrapper = isVerticalNavOpenConnector(
  function SearchPrintWrapperBase({
    children, className, style, verticalNavOpen, ...props
  }: SearchPrintWrapperProps & React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        {...props}
        className={classNames(
          'topbar-search-print-wrapper',
          'topbar-shadow',
          {
            'topbar-search-print-wrapper--sidebar-closed': !verticalNavOpen,
          },
          className
        )}
        style={{
          '--topbar-desktop-height': `${topbarDesktopHeight}rem`,
          '--content-wrapper-max-width': `${contentWrapperMaxWidth}rem`,
          '--neutral-bg': theme.color.neutral.base,
          '--sidebar-transition-time': `${sidebarTransitionTime}ms`,
          '--topbar-mobile-height': `${topbarMobileHeight}rem`,
          '--button-min-width': `${buttonMinWidth}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);

interface MobileSearchContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MobileSearchContainer(
  { children, className, style, ...props }: MobileSearchContainerProps & React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      className={classNames('topbar-mobile-search-container', className)}
      style={{
        '--mobile-search-margin': `${mobileSearchContainerMargin}rem`,
        '--mobile-search-input-height': `${toolbarSearchInputMobileHeight}rem`,
        '--max-nav-width': `${contentWrapperMaxWidth}rem`,
        '--page-padding-desktop': `${theme.padding.page.desktop}rem`,
        '--page-padding-mobile': `${theme.padding.page.mobile}rem`,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface MobileSearchWrapperProps {
  mobileToolbarOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MobileSearchWrapper({
  mobileToolbarOpen, children, className, style, ...props
}: MobileSearchWrapperProps & React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      className={classNames(
        'topbar-mobile-search-wrapper',
        'topbar-shadow',
        {
          'topbar-mobile-search-wrapper--mobile-toolbar-open': mobileToolbarOpen,
          'topbar-mobile-search-wrapper--mobile-toolbar-closed': !mobileToolbarOpen,
        },
        className
      )}
      style={{
        '--mobile-search-wrapper-height': `${toolbarMobileSearchWrapperHeight}rem`,
        '--neutral-bg': theme.color.neutral.base,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function Hr({ className, style, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      {...props}
      className={classNames('topbar-hr', className)}
      style={{
        '--toolbar-hr-height': `${toolbarHrHeight}rem`,
        ...style,
      } as React.CSSProperties}
    />
  );
}

export const LeftArrow = styled(AngleLeftIcon)`
  width: 2.5rem;
  height: 2.5rem;
`;

export function InnerText({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={classNames('topbar-inner-text', className)}>
      {children}
    </div>
  );
}

export const SeachResultsTextButton = styled(PlainButton)`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  display: flex;
  overflow: visible;
  min-width: auto;
`;

interface TextResizerDropdownProps {
  mobileVariant?: boolean;
  mobileToolbarOpen?: boolean;
  transparentTab?: boolean;
  showLabel?: boolean;
  showAngleIcon?: boolean;
  toggleChildren?: JSX.Element;
  label: string;
  ariaLabelId: string;
  dataAnalyticsLabel: string;
  controlsId: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function TextResizerDropdown({
  mobileVariant,
  mobileToolbarOpen,
  children,
  className,
  style,
  ...props
}: TextResizerDropdownProps) {
  return (
    <FilterDropdown
      {...props}
      className={classNames(
        'topbar-text-resizer-dropdown',
        {
          'topbar-text-resizer-dropdown--mobile-variant': mobileVariant !== false,
          'topbar-text-resizer-dropdown--mobile-hidden': mobileVariant !== false && !mobileToolbarOpen,
        },
        className
      )}
      style={style}
    >
      {children}
    </FilterDropdown>
  );
}

interface TextResizerMenuProps {
  id?: string;
  bookTheme?: BookWithOSWebData['theme'];
  textSize?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function TextResizerMenu({
  bookTheme, textSize, children, className, style, ...props
}: TextResizerMenuProps & React.HTMLAttributes<HTMLDivElement>
) {
  // Calculate gradient for the text resizer slider
  const gradientPercent = textSize
    ? `calc((${textSize} - ${textResizerMinValue}) * 100 / (${textResizerMaxValue} - ${textResizerMinValue}) * 1%)`
    : '0%';

  const gradient = bookTheme
    ? `linear-gradient(
        to right,
        ${theme.color.primary[bookTheme].base} ${gradientPercent},
        ${theme.color.primary.gray.medium} ${gradientPercent}
      )`
    : theme.color.primary.gray.medium;

  return (
    <div
      {...props}
      className={classNames('topbar-text-resizer-menu', className)}
      style={{
        '--text-resizer-color': theme.color.primary.gray.base,
        '--text-resizer-gradient': gradient,
        '--text-resizer-fallback-bg': theme.color.primary.gray.medium,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface TextResizerChangeButtonProps {
  ariaLabelId?: string;
  children?: React.ReactNode;
  onClick?: (e: React.FormEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TextResizerChangeButton(
  { ariaLabelId, children, className, style, ...props }: TextResizerChangeButtonProps
) {
  const intl = useIntl();

  // Filter transient props before spreading to DOM
  const safeProps = Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = (props as Record<string, unknown>)[key];
    }
    return acc;
  }, {});

  return (
    <PlainButton
      {...safeProps}
      {...(ariaLabelId && {
        'aria-label': intl.formatMessage({ id: ariaLabelId }),
      })}
      className={classNames('topbar-text-resizer-change-button', className)}
      style={style}
    >
      {children}
    </PlainButton>
  );
}

export const CloseSearchResultsTextButton = styled(SeachResultsTextButton)`
  display: none;

  @media screen and (max-width: 50em) {
    display: block;
  }
`;
