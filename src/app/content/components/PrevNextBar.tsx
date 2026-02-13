import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { decoratedLinkStyle, textRegularLineHeight, textRegularStyle } from '../../components/Typography';
import * as navSelect from '../../navigation/selectors';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveTreeSection, Book, ContentQueryParams } from '../types';
import { contentTextWidth } from './constants';
import ContentLink from './ContentLink';
import { disablePrint } from './utils/disablePrint';

const prevNextIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
`;

const LeftArrow = styled(ChevronLeft)`
  ${prevNextIconStyles}
`;

const RightArrow = styled(ChevronRight)`
  ${prevNextIconStyles}
  margin-top: 0.1rem;
`;

interface HidingContentLinkProps {
  book?: Book;
  page?: ArchiveTreeSection;
  side: 'left' | 'right';
}
const HidingContentLinkComponent = ({page, book, side, ...props}: HidingContentLinkProps) =>
  page !== undefined && book !== undefined
    ? <ContentLink book={book} page={page} {...props} />
    : <span aria-hidden />;

const HidingContentLink = styled(HidingContentLinkComponent)`
  ${decoratedLinkStyle}
  ${(props) => props.side === 'left' && theme.breakpoints.mobile(css`
    margin-left: -0.8rem;
  `)}
  ${(props) => props.side === 'right' && theme.breakpoints.mobile(css`
    margin-right: -0.8rem;
  `)}
`;

const BarWrapper = styled.div`
  ${disablePrint}
  ${textRegularStyle}
  overflow: visible;
  width: 100%;
  max-width: ${contentTextWidth}rem;
  justify-content: space-between;
  height: 4rem;
  display: flex;
  align-items: center;
  margin: 5rem auto 3rem auto;
  border-top: solid 0.1rem ${theme.color.neutral.darkest};
  border-bottom: solid 0.1rem ${theme.color.neutral.darkest};

  a {
    border: none;
    display: flex;
  }

  ${theme.breakpoints.mobile(css`
    margin: 3.5rem auto 3rem auto;
    border: 0;
  `)}
`;

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

export const PrevNextBar = ({book, prevNext, queryParams, ...props}: PropTypes) => {
  const { formatMessage } = useIntl();

  if (!prevNext) {
    return null;
  }

  return <BarWrapper data-analytics-region='prev-next'>
    <HidingContentLink side='left'
      book={book}
      page={prevNext.prev}
      queryParams={queryParams}
      onClick={props.onPrevious}
      handleClick={props.handlePrevious}
      aria-label={formatMessage({id: 'i18n:prevnext:prev:aria-label'})}
      data-analytics-label='prev'
    >
      <LeftArrow />
      <FormattedMessage id='i18n:prevnext:prev:text'>
        {(msg: string) => msg}
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
        {(msg: string) => msg}
      </FormattedMessage>
      <RightArrow />
    </HidingContentLink>
  </BarWrapper>;
};

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    prevNext: select.prevNextPage(state),
    queryParams: navSelect.persistentQueryParameters(state),
  })
)(PrevNextBar);
