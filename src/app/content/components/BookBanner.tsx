import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import {ChevronLeft} from 'styled-icons/boxicons-regular/ChevronLeft'
import { findArchiveTreeSection, bookDetailsUrl } from '../utils'
import Color from 'color';
import {h3Style, h4Style} from '../../components/Typography';

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  height: 2rem;
  width: 2rem;
  color: ${theme.color.neutral.base};
  margin-right: 0.7rem;
`;

interface PropTypes {
  page?: Page;
  book?: Book;
}

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  width: 100%;
  max-width: 117rem;
  margin: 0 auto;
  text-align: left;
`;

// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  color: ${theme.color.primary.blue.foreground};
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 87rem;
  text-overflow: ellipsis;
  margin: 0;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    line-height: 2.5rem;
  }
`;

// tslint:disable-next-line:variable-name
const BookChapter = styled.h1`
  ${h3Style}
  color: ${theme.color.primary.blue.foreground};
  font-weight: bold;
  display: inline-block;
  width: 100%;
  max-width: 87rem;
  margin-top: 1rem;
  margin-bottom: 0;
  
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; 

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    line-height: 2.2rem;
    margin-top: 0.3rem;
    -webkit-line-clamp: 2;
  }
`;

const blue = `${theme.color.primary.blue.base}`;
const color = Color(blue).lighten(0.7); 

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  padding: ${theme.contentBuffer.default.padding};
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 13rem;
  background: linear-gradient(to right, ${blue}, ${color.hex()});

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    padding: ${theme.contentBuffer.mobile.default.padding};
    height: 10.4rem;
  }
`;

// tslint:disable-next-line:variable-name
export class BookBanner extends Component<PropTypes> {
  public render() {
    const {page, book} = this.props as PropTypes;
    
    if (!book || !page) {
      return null
    }

    const treeSection = findArchiveTreeSection(book, page.id);
    const bookUrl = bookDetailsUrl(book);

    if(!treeSection) {
      return null;
    }

    return <BarWrapper>
      <TopBar>
        <BookTitle href={bookUrl}><LeftArrow/>{book.tree.title}</BookTitle>
        <BookChapter dangerouslySetInnerHTML={{__html: treeSection.title}}></BookChapter>
      </TopBar>
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(BookBanner);

