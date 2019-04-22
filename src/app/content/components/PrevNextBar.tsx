import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { textRegularLineHeight } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveTreeSection, Book } from '../types';
import ContentLink from './ContentLink';
import { contentTextStyle } from './Page';

const prevNextIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  ${prevNextIconStyles}
  margin-right: -1rem;
`;

// tslint:disable-next-line:variable-name
const RightArrow = styled(ChevronRight)`
  ${prevNextIconStyles}
  margin-left: -1rem;
`;

interface HidingContentLinkProps {
  book?: Book;
  page?: ArchiveTreeSection;
}
// tslint:disable-next-line:variable-name
const HidingContentLink: React.SFC<HidingContentLinkProps> = ({page, book, ...props}) =>
  page !== undefined && book !== undefined
    ? <ContentLink book={book} page={page} {...props} />
    : <span aria-hidden />;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  ${contentTextStyle}
  justify-content: space-between;
  height: 4rem;
  display: flex;
  align-items: center;
  margin: 5rem auto 4rem auto;
  border-top: solid 0.1rem ${theme.color.neutral.darkest};
  border-bottom: solid 0.1rem ${theme.color.neutral.darkest};

  a {
    border: none;
    display: flex;
    align-items: center;
    height: 2.5rem;
    line-height: 0rem;
  }

  ${theme.breakpoints.mobile(css`
    margin: 3.5rem auto 3.7rem auto;
    border: 0;
  `)}
`;

const svgViewBox = {
  left: '8 0 24 24',
  right: '-8 0 24 24',
};

interface PropTypes {
  book?: Book;
  prevNext: {
    prev?: ArchiveTreeSection;
    next?: ArchiveTreeSection;
  };
}

// tslint:disable-next-line:variable-name
const PrevNextBar: React.SFC<PropTypes> = ({book, prevNext}) => <BarWrapper>
  <FormattedMessage id='i18n:prevnext:prev:aria-label'>
    {(ariaLabel: Element | string) =>
    <HidingContentLink book={book} page={prevNext.prev} aria-label={ariaLabel}>
      <LeftArrow viewBox={svgViewBox.left}/>
      <FormattedMessage id='i18n:prevnext:prev:text'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </HidingContentLink>
    }
  </FormattedMessage>

  <FormattedMessage id='i18n:prevnext:next:aria-label'>
    {(ariaLabel: Element | string) =>
    <HidingContentLink book={book} page={prevNext.next} aria-label={ariaLabel}>
      <FormattedMessage id='i18n:prevnext:next:text'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
      <RightArrow viewBox={svgViewBox.right}/>
    </HidingContentLink>
    }
  </FormattedMessage>
</BarWrapper>;

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    prevNext: select.prevNextPage(state),
  })
)(PrevNextBar);
