import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { scrollTo } from '../../domUtils';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertNotNull } from '../../utils';
import { hasOSWebData } from '../guards';
import * as select from '../selectors';
import { Book, BookWithOSWebData, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { splitTitleParts } from '../utils/archiveTreeUtils';
import { bookIdsWithSpecialAttributionText, compensateForUTC, getAuthors, getPublishDate } from './utils/attributionValues';
import { ExpandIcon, CollapseIcon } from '../../components/Details';
import { linkColor, linkHover } from '../../components/Typography/Links.constants';
import { contentTextWidth } from './constants';
import './Attribution.css';

export const detailsMarginTop = 3;
const desktopSpacing = 1.8;
const mobileSpacing = 0.8;
export const textRegularLineHeight = 2.5;
export const desktopAttributionHeight = detailsMarginTop + textRegularLineHeight + desktopSpacing * 2;
export const mobileAttributionHeight = detailsMarginTop + textRegularLineHeight + mobileSpacing * 2;

type AttributionSummaryProps = React.HTMLAttributes<HTMLElement>;

function AttributionSummary({ className, style, ...props }: AttributionSummaryProps) {
  const message = useIntl().formatMessage({id: 'i18n:attribution:toggle'});

  return (
    <summary
      {...props}
      className={classNames('attribution-summary', className)}
      aria-label={message}
      style={{
        '--attribution-text-color': theme.color.text.default,
        '--link-color': linkColor,
        '--link-hover': linkHover,
        ...style,
      } as React.CSSProperties}
    >
      <ExpandIcon className={classNames('attribution-summary-icon', 'attribution-expand-icon')} />
      <CollapseIcon className={classNames('attribution-summary-icon', 'attribution-collapse-icon')} />
      <span role="heading" aria-level={2}>{message}</span>
    </summary>
  );
}

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  values?: Record<string, Date | string | number | null>;
}

function Content({ values, className, style, ...props }: ContentProps) {
  const html = useIntl().formatMessage({id: 'i18n:attribution:text'}, values, {ignoreTag: true});

  return (
    <div
      {...props}
      className={classNames('attribution-content', className)}
      style={{
        '--content-text-width': `${contentTextWidth}rem`,
        ...style,
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{__html: html}}
    />
  );
}

function CodeRunnerNote({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const html = useIntl().formatMessage({id: 'i18n:attribution:code-runner'}, undefined, {ignoreTag: true});

  return (
    <div
      {...props}
      className={classNames('attribution-content', className)}
      style={{
        '--content-text-width': `${contentTextWidth}rem`,
        ...style,
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{__html: html}}
    />
  );
}

interface AttributionProps {
  book: Book | undefined;
  page: Page | undefined;
}

function getAttributionValues(book: BookWithOSWebData, page: Page) {
  const introPage = findDefaultBookPage(book);
  const bookWithoutExplicitVersions = {
    ...book,
    loadOptions: {booksConfig: book.loadOptions.booksConfig},
  };

  const [, introTitlePart] = splitTitleParts(introPage.title);
  const [, currentTitlePart] = splitTitleParts(page.title);
  const introPageTitle = `${introTitlePart} - ${book.title} | OpenStax`;
  const introPageUrl = getBookPageUrlAndParams(bookWithoutExplicitVersions, introPage).url;
  const currentPageUrl = getBookPageUrlAndParams(bookWithoutExplicitVersions, page).url;
  const currentPageTitle = `${currentTitlePart} - ${book.title} | OpenStax`;

  assertNotNull(book.publish_date, `BUG: Could not find publication date`);
  const bookPublishDate = getPublishDate(book);
  const bookLatestRevision = new Date(book.revised);

  compensateForUTC(bookLatestRevision);

  const authorsToDisplay = getAuthors(book);

  return {
    bookAuthors: authorsToDisplay.map(({value: {name}}) => name).join(', '),
    bookLatestRevision,
    bookLicenseName: book.license.name,
    bookLicenseUrl: book.license.url,
    bookLicenseVersion: book.license.version,
    bookPublishDate,
    bookTitle: book.title,
    copyrightHolder: 'OpenStax',
    currentPath: currentPageUrl,
    currentPageTitle,
    introPageTitle,
    introPageUrl,
    originalMaterialLink: null,
    ...bookIdsWithSpecialAttributionText[book.id] || {},
  };
}

export function Attribution({ book, page }: AttributionProps) {
  const containerRef = useRef<HTMLDetailsElement>(null);
  const previousPageRef = useRef<Page | undefined>(page);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const toggleHandler = () => {
      if (container.getAttribute('open') !== null) {
        scrollTo(container);
      }
    };

    container.addEventListener('toggle', toggleHandler);

    return () => {
      container.removeEventListener('toggle', toggleHandler);
    };
  }, []);

  useLayoutEffect(() => {
    if (containerRef.current && previousPageRef.current && previousPageRef.current !== page) {
      containerRef.current.removeAttribute('open');
    }
    previousPageRef.current = page;
  }, [page]);

  if (!hasOSWebData(book) || !page) {
    return null;
  }

  const values = getAttributionValues(book, page);

  return (
    <details
      ref={containerRef}
      className="attribution-details"
      data-testid="attribution-details"
      data-analytics-region="attribution"
      style={{
        '--attribution-text-color': theme.color.text.default,
        '--link-color': linkColor,
        '--link-hover': linkHover,
        '--content-text-width': `${contentTextWidth}rem`,
      } as React.CSSProperties}
    >
      <AttributionSummary />
      <Content values={values} />
      {book.slug.includes('python') && (
        <strong>
          <CodeRunnerNote />
        </strong>
      )}
    </details>
  );
}

export default function AttributionConnected() {
  const { book, page } = useSelector((state: AppState) => select.bookAndPage(state));

  return <Attribution book={book} page={page} />;
}
