import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { linkColor, linkHover } from '../../components/Typography/Links.constants';
import { textRegularLineHeight } from '../../components/Typography';
import * as navSelect from '../../navigation/selectors';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveTreeSection, Book, ContentQueryParams } from '../types';
import { contentTextWidth } from './constants';
import ContentLink from './ContentLink';
import { disablePrintClass } from './utils/disablePrint';
import { ChevronLeftIcon, ChevronRightIcon } from './ChevronIcons';
import './PrevNextBar.css';

interface HidingContentLinkProps {
  book?: Book;
  page?: ArchiveTreeSection;
  side: 'left' | 'right';
  queryParams?: ContentQueryParams;
  onClick?: () => void;
  handleClick?: () => void;
  'aria-label'?: string;
  'data-analytics-label'?: string;
  children?: React.ReactNode;
}

const HidingContentLink = ({page, book, side, children, ...props}: HidingContentLinkProps) =>
  page !== undefined && book !== undefined
    ? <ContentLink
        book={book}
        page={page}
        className={classNames('prev-next-link', `side-${side}`)}
        style={{
          '--link-color': linkColor,
          '--link-hover': linkHover,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </ContentLink>
    : <span aria-hidden />;

interface PropTypes {
  book?: Book;
  onPrevious?: () => void;
  onNext?: () => void;
  handlePrevious?: () => void;
  handleNext?: () => void;
  queryParams?: ContentQueryParams;
  prevNext: null | {
    prev?: ArchiveTreeSection;
    next?: ArchiveTreeSection;
  };
}

/**
 * PrevNextBar component - Navigation bar for previous/next page links
 */
export const PrevNextBar = ({book, prevNext, queryParams, ...props}: PropTypes) => {
  const { formatMessage } = useIntl();

  if (!prevNext) {
    return null;
  }

  return (
    <div
      className={classNames('prev-next-bar-wrapper', disablePrintClass)}
      data-analytics-region='prev-next'
      style={{
        '--text-color': theme.color.text.default,
        '--text-regular-line-height': `${textRegularLineHeight}rem`,
        '--content-text-width': `${contentTextWidth}rem`,
        '--neutral-darkest': theme.color.neutral.darkest,
      } as React.CSSProperties}
    >
      <HidingContentLink side='left'
        book={book}
        page={prevNext.prev}
        queryParams={queryParams}
        onClick={props.onPrevious}
        handleClick={props.handlePrevious}
        aria-label={formatMessage({id: 'i18n:prevnext:prev:aria-label'})}
        data-analytics-label='prev'
      >
        <ChevronLeftIcon className={classNames('prev-next-icon', 'left-arrow')} />
        <FormattedMessage id='i18n:prevnext:prev:text'>
          {(msg) => msg}
        </FormattedMessage>
      </HidingContentLink>

      <HidingContentLink side='right'
        book={book}
        page={prevNext.next}
        queryParams={queryParams}
        onClick={props.onNext}
        handleClick={props.handleNext}
        aria-label={formatMessage({id: 'i18n:prevnext:next:aria-label'})}
        data-analytics-label='next'
      >
        <FormattedMessage id='i18n:prevnext:next:text'>
          {(msg) => msg}
        </FormattedMessage>
        <ChevronRightIcon className={classNames('prev-next-icon', 'right-arrow')} />
      </HidingContentLink>
    </div>
  );
};

export default function ConnectedPrevNextBar() {
  const book = useSelector((state: AppState) => select.book(state));
  const prevNext = useSelector((state: AppState) => select.prevNextPage(state));
  const queryParams = useSelector((state: AppState) => navSelect.persistentQueryParameters(state));

  return <PrevNextBar book={book} prevNext={prevNext} queryParams={queryParams} />;
}
