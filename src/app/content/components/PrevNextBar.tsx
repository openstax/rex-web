import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { decoratedLinkStyle, textRegularLineHeight, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveTreeSection, Book } from '../types';
import { contentTextWidth } from './constants';
import ContentLink from './ContentLink';
import { disablePrint } from './utils/disablePrint';

const prevNextIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  ${prevNextIconStyles}
`;

// tslint:disable-next-line:variable-name
const RightArrow = styled(ChevronRight)`
  ${prevNextIconStyles}
  margin-top: 0.1rem;
`;

interface HidingContentLinkProps {
  book?: Book;
  page?: ArchiveTreeSection;
  side: 'left' | 'right';
}
// tslint:disable-next-line:variable-name
const HidingContentLinkComponent = ({page, book, side, ...props}: HidingContentLinkProps) =>
  page !== undefined && book !== undefined
    ? <ContentLink book={book} page={page} {...props} />
    : <span aria-hidden />;

// tslint:disable-next-line:variable-name
const HidingContentLink = styled(HidingContentLinkComponent)`
  ${decoratedLinkStyle}
  ${(props) => props.side === 'left' && theme.breakpoints.mobile(css`
    margin-left: -0.8rem;
  `)}
  ${(props) => props.side === 'right' && theme.breakpoints.mobile(css`
    margin-right: -0.8rem;
  `)}
`;

// tslint:disable-next-line:variable-name
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
  prevNext: null | {
    prev?: ArchiveTreeSection;
    next?: ArchiveTreeSection;
  };
}

// tslint:disable-next-line:variable-name
const PrevNextBar = ({book, prevNext}: PropTypes) => {
  const { formatMessage } = useIntl();

  if (!prevNext) {
    return null;
  }

  return <BarWrapper data-analytics-region='prev-next'>
    <HidingContentLink side='left'
      book={book}
      page={prevNext.prev}
      aria-label={formatMessage({id: 'i18n:prevnext:prev:aria-label'})}
      data-analytics-label='prev'
    >
      <LeftArrow />
      <FormattedMessage id='i18n:prevnext:prev:text'>
        {(msg) => msg}
      </FormattedMessage>
    </HidingContentLink>

    <HidingContentLink side='right'
      book={book}
      page={prevNext.next}
      aria-label={formatMessage({id: 'i18n:prevnext:next:aria-label'})}
      data-analytics-label='next'
    >
      <FormattedMessage id='i18n:prevnext:next:text'>
        {(msg) => msg}
      </FormattedMessage>
      <RightArrow />
    </HidingContentLink>
  </BarWrapper>;
};

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    prevNext: select.prevNextPage(state),
  })
)(PrevNextBar);
