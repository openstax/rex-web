import { HTMLAnchorElement, HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, textRegularLineHeight } from '../../components/Typography';
import { useServices } from '../../context/Services';
import theme from '../../theme';
import { assertDefined, assertWindow } from '../../utils';
import { hasOSWebData } from '../guards';
import { isPortaled } from '../../guards';
import showConfirmation from '../highlights/components/utils/showConfirmation';
import { hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../highlights/selectors';
import * as select from '../selectors';
import { BookWithOSWebData } from '../types';
import { isClickWithModifierKeys } from '../utils/domUtils';
import { bookDetailsUrl } from '../utils/urlUtils';
import {
  bookBannerDesktopBigHeight,
  bookBannerDesktopMiniHeight,
  bookBannerMobileBigHeight,
  bookBannerMobileMiniHeight,
  contentTextWidth,
} from './constants';
import './BookBanner.css';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * ChevronLeft icon for BookBanner component.
 * SVG path from Boxicons (https://boxicons.com - MIT License)
 */
function ChevronLeftIcon({ className, ...props }: IconProps) {
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

const gradients: {[key in BookWithOSWebData['theme']]: string} = {
  'blue': '#004aa2',
  'deep-green': '#12A28C',
  'gray': '#97999b',
  'green': '#9cd14a',
  'light-blue': '#1EE1F0',
  'midnight': '#005a72',
  'orange': '#FAA461',
  'raise-green': '#107b70',
  'red': '#E34361',
  'yellow': '#faea36',
};

const bookTitleMiniNavDesktopWidth = 27;

interface BookTitleProps {
  colorSchema: BookWithOSWebData['theme'];
  variant?: 'mini' | 'big';
  children: React.ReactNode;
  'data-testid'?: string;
}

function BookTitle({ colorSchema, variant = 'big', children, ...props }: BookTitleProps) {
  const textColor = theme.color.primary[colorSchema].foreground;
  const bannerTextMaxWidth = maxNavWidth - (maxNavWidth - contentTextWidth) / 2;

  return (
    <span
      {...props}
      className={classNames('book-banner-title', 'book-banner-text', `variant-${variant}`)}
      style={{
        '--book-text-color': textColor,
        '--banner-text-max-width': `${bannerTextMaxWidth}rem`,
        '--text-regular-line-height': `${textRegularLineHeight}rem`,
        '--book-title-mini-nav-desktop-width': `${bookTitleMiniNavDesktopWidth}rem`,
      } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

interface BookTitleLinkProps extends BookTitleProps {
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
}

function BookTitleLink({ colorSchema, variant = 'big', children, href, onClick, tabIndex, ...props }: BookTitleLinkProps) {
  const textColor = theme.color.primary[colorSchema].foreground;
  const bannerTextMaxWidth = maxNavWidth - (maxNavWidth - contentTextWidth) / 2;

  return (
    <a
      {...props}
      href={href}
      onClick={onClick}
      tabIndex={tabIndex}
      className={classNames('book-banner-title', 'book-banner-title-link', 'book-banner-text', `variant-${variant}`)}
      style={{
        '--book-text-color': textColor,
        '--banner-text-max-width': `${bannerTextMaxWidth}rem`,
        '--text-regular-line-height': `${textRegularLineHeight}rem`,
        '--book-title-mini-nav-desktop-width': `${bookTitleMiniNavDesktopWidth}rem`,
      } as React.CSSProperties}
    >
      <ChevronLeftIcon
        className="book-banner-left-arrow"
        style={{ '--book-text-color': textColor } as React.CSSProperties}
      />
      {children}
    </a>
  );
}

interface BookChapterProps {
  colorSchema: BookWithOSWebData['theme'];
  variant?: 'mini' | 'big';
  dangerouslySetInnerHTML: { __html: string };
}

function BookChapter({ colorSchema, variant = 'big', dangerouslySetInnerHTML }: BookChapterProps) {
  const textColor = theme.color.primary[colorSchema].foreground;
  const bannerTextMaxWidth = maxNavWidth - (maxNavWidth - contentTextWidth) / 2;
  const bookChapterMiniMaxWidth = maxNavWidth - bookTitleMiniNavDesktopWidth - (maxNavWidth - contentTextWidth) / 2;
  const Tag = variant === 'mini' ? 'span' : 'h1';

  return (
    <Tag
      className={classNames('book-banner-chapter', 'book-banner-text', `variant-${variant}`)}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      style={{
        '--book-text-color': textColor,
        '--banner-text-max-width': `${bannerTextMaxWidth}rem`,
        '--book-chapter-mini-max-width': `${bookChapterMiniMaxWidth}rem`,
        '--h3-mobile-line-height-doubled': `${h3MobileLineHeight * 2}rem`,
      } as React.CSSProperties}
    />
  );
}

interface BarWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  colorSchema: BookWithOSWebData['theme'] | undefined;
  up?: boolean;
  variant?: 'mini' | 'big';
  children?: React.ReactNode;
  'data-testid'?: string;
  'data-analytics-region'?: string;
}

export const BarWrapper = React.forwardRef<HTMLDivElement, BarWrapperProps>(
  function BarWrapper({ colorSchema, up = false, variant = 'big', children, className, style, ...props }, ref) {
    // Compute gradient background
    const gradient = colorSchema
      ? `linear-gradient(to right, ${assertDefined(
          theme.color.primary[colorSchema],
          `Could not find values for theme named "${colorSchema}"`
        ).base}, ${assertDefined(
          gradients[colorSchema],
          `theme ${colorSchema} needs gradient defined in BookBanner.tsx`
        )})`
      : undefined;

    const zIndexBig = theme.zIndex.navbar - 1;
    const zIndexMini = theme.zIndex.navbar - 2;

    return (
      <div
        {...props}
        ref={ref}
        className={classNames(
          'book-banner-bar-wrapper',
          `variant-${variant}`,
          { up },
          className
        )}
        style={{
          '--book-banner-gradient': gradient,
          '--page-padding-desktop': `${theme.padding.page.desktop}rem`,
          '--page-padding-mobile': `${theme.padding.page.mobile}rem`,
          '--banner-desktop-big-height': `${bookBannerDesktopBigHeight}rem`,
          '--banner-desktop-mini-height': `${bookBannerDesktopMiniHeight}rem`,
          '--banner-mobile-big-height': `${bookBannerMobileBigHeight}rem`,
          '--banner-mobile-mini-height': `${bookBannerMobileMiniHeight}rem`,
          '--z-index-big': zIndexBig,
          '--z-index-mini': zIndexMini,
          '--max-nav-width': `${maxNavWidth}rem`,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);

interface BookBannerState {
  scrollTransition: boolean;
  tabbableBanner: 'mini' | 'big';
}

/**
 * BookBanner component - Displays book title and chapter information with scroll behavior
 *
 * Migrated from styled-components to plain CSS.
 */
function BookBanner() {
  const [bookBannerState, setBookBannerState] = React.useState<BookBannerState>({
    scrollTransition: false,
    tabbableBanner: 'big',
  });
  const book = useSelector(select.book);
  const treeSection = useSelector(select.pageNode);
  const bookTheme = useSelector(select.bookTheme);
  const params = useSelector(select.contentParams);
  const hasUnsavedHighlight = useSelector(hasUnsavedHighlightSelector);
  const miniBanner = React.useRef<HTMLDivElement>(null);
  const bigBanner = React.useRef<HTMLDivElement>(null);
  const services = useServices();

  const handleScroll = () => {
    if (miniBanner.current && bigBanner.current && typeof(window) !== 'undefined') {
      const miniRect = miniBanner.current.getBoundingClientRect();

      setBookBannerState({
        scrollTransition: miniRect.top === 0
        && bigBanner.current.offsetTop + bigBanner.current.clientHeight > window.scrollY,
        tabbableBanner: miniRect.top === 0 ? 'mini' : 'big',
      });
    }
  };

  const handleLinkClick = async(e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (isClickWithModifierKeys(e) || !hasUnsavedHighlight) {
      return;
    }
    e.preventDefault();

    if (!await showConfirmation(services)) {
      return;
    }
    assertWindow().location.assign(link);
  };

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      document?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!book) {
    return <BarWrapper colorSchema={undefined} up={false} />;
  }

  const bookUrl = hasOSWebData(book)
    ? book.book_state !== 'retired' && !isPortaled(params)
      ? bookDetailsUrl(book)
      : undefined
    : undefined;

  return <>
    <BarWrapper
      colorSchema={bookTheme}
      variant='big'
      key='expanded-nav'
      up={bookBannerState.scrollTransition}
      ref={bigBanner}
      data-testid='bookbanner'
      data-analytics-region='book-banner-expanded'
    >
      <div className={classNames('book-banner-top-bar')} style={{ '--max-nav-width': `${maxNavWidth}rem` } as React.CSSProperties}>
        {
          bookUrl === undefined
            ? <BookTitle data-testid='book-title-expanded' colorSchema={bookTheme}>
              {book.tree.title}
            </BookTitle>
            : <BookTitleLink
              data-testid='details-link-expanded'
              href={bookUrl}
              colorSchema={bookTheme}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                handleLinkClick(e, bookUrl);
              }}
              tabIndex={bookBannerState.tabbableBanner === 'big' ? undefined : -1}
            >
              {book.tree.title}
            </BookTitleLink>
        }
        {treeSection
          ? <BookChapter
            colorSchema={bookTheme}
            dangerouslySetInnerHTML={{ __html: treeSection.title }}
          />
          : null}
      </div>
    </BarWrapper>
    <BarWrapper
      colorSchema={bookTheme}
      variant='mini'
      key='mini-nav'
      ref={miniBanner}
      data-testid='bookbanner-collapsed'
      data-analytics-region='book-banner-collapsed'
    >
      <div className={classNames('book-banner-top-bar')} style={{ '--max-nav-width': `${maxNavWidth}rem` } as React.CSSProperties}>
        {
          bookUrl === undefined
            ? <BookTitle data-testid='book-title-collapsed' colorSchema={bookTheme} variant='mini'>
              {book.title}
            </BookTitle>
            : <BookTitleLink
              data-testid='details-link-collapsed'
              href={bookUrl}
              variant='mini'
              colorSchema={bookTheme}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                handleLinkClick(e, bookUrl);
              }}
              tabIndex={bookBannerState.tabbableBanner === 'mini' ? undefined : -1}
            >
              {book.tree.title}
            </BookTitleLink>
        }
        {treeSection
          ? <BookChapter
            colorSchema={bookTheme}
            variant='mini'
            dangerouslySetInnerHTML={{ __html: treeSection.title }}
          />
          : null
        }
      </div>
    </BarWrapper>
  </>;
}

export default BookBanner;
