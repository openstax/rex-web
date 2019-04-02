import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { ChevronRight } from 'styled-icons/boxicons-regular/ChevronRight';
import { linkStyle, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, LinkedArchiveTreeSection, Page } from '../types';
import { findArchiveTreeSection } from '../utils/archiveTreeUtils';
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
const PrevPage = styled.span`
  ${textRegularStyle}
  ${linkStyle}
  border: none;
`;

// tslint:disable-next-line:variable-name
const NextPage = styled.span`
  ${textRegularStyle}
  ${linkStyle}
  border: none;
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${theme.color.neutral.base};
  margin-top: 5rem;
  margin-bottom: 6rem;
  padding: 0 4rem;
  border-top: solid 0.1rem ${theme.color.neutral.darkest};
  border-bottom: solid 0.1rem ${theme.color.neutral.darkest};
  height: 4rem;
`;

// tslint:disable-next-line:variable-name
export class PrevNextBar extends Component<PropTypes> {
  public render() {
    const {page, book, prevNext} = this.props;
    let prev;
    let next;

    if (!book || !page) {
      return null;
    }

    const treeSection = findArchiveTreeSection(book, page.id);

    if (!treeSection || !prevNext) {
      return null;
    }

    if ( prevNext.prev) {
      prev = <ContentLink book={book} page={prevNext.prev}><PrevPage><LeftArrow/>Previous</PrevPage></ContentLink>;
    } else {
      prev = <PrevPage><LeftArrow/>Previous</PrevPage>;
    }

    if ( prevNext.next ) {
      next = <ContentLink book={book} page={prevNext.next}><NextPage>Next<RightArrow/></NextPage></ContentLink>;
    } else {
      next = <NextPage>Next<RightArrow/></NextPage>;
    }

    return <BarWrapper>
      {prev}
      {next}
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
