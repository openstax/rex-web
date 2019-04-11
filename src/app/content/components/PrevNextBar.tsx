import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { decoratedLinkStyle, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, LinkedArchiveTreeSection, Page } from '../types';
import ContentLink from './ContentLink';

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  height: 3rem;
  width: 3rem;
`;

// tslint:disable-next-line:variable-name
const RightArrow = styled(ChevronRight)`
  height: 3rem;
  width: 3rem;
`;

interface PropTypes {
  page?: Page;
  book?: Book;
  prevNext?: {
    prev?: LinkedArchiveTreeSection;
    next?: LinkedArchiveTreeSection;
  };
}

// tslint:disable-next-line:variable-name
const PrevLinkElement = styled(ContentLink)`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  float: left;
`;

// tslint:disable-next-line:variable-name
const NextLinkElement = styled(ContentLink)`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  float: right;
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  margin-top: 5rem;
  margin-bottom: 6rem;
  padding: 0 4rem;
  border-top: solid 0.1rem ${theme.color.neutral.darkest};
  border-bottom: solid 0.1rem ${theme.color.neutral.darkest};
  height: 4rem;
  display: flex;
  align-items: center;
  ${theme.breakpoints.mobile(css`
    margin-top: 3.5rem;
    margin-bottom: 4.5rem;
    border: none;
    padding: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const LinksWrapper = styled.div`
  width: 100%;
  max-width: 57rem;
  margin: 0 auto;
`;

// tslint:disable-next-line:variable-name
export class PrevNextBar extends Component<PropTypes> {
  public render() {
    const {page, book, prevNext} = this.props;
    let prev;
    let next;

    if (!book || !page || !prevNext) {
      return null;
    }

    if ( prevNext.prev ) {
      prev = <PrevLinkElement book={book} page={prevNext.prev}><LeftArrow/>Previous</PrevLinkElement>;
    }

    if ( prevNext.next ) {
      next = <NextLinkElement book={book} page={prevNext.next} aria-label='Next Page'>Next
      <RightArrow/></NextLinkElement>;
    }

    return <BarWrapper>
      <LinksWrapper>
        {prev}
        {next}
      </LinksWrapper>
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
    prevNext: select.prevNextPage(state),
  })
)(PrevNextBar);
