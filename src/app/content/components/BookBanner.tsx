import Color from 'color';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { h3Style, h4Style } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { bookDetailsUrl, findArchiveTreeSection } from '../utils';

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

const bookBannerTextStyle = css`
  width: 100%;
  max-width: 87rem;
  padding: 0;
  color: ${theme.color.primary.blue.foreground};
`;

// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  ${bookBannerTextStyle}
  font-weight: normal;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0;
  text-decoration: none;

  ${theme.breakpoints.mobile(css`
    line-height: 2.5rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const BookChapter = styled.h1`
  ${h3Style}
  ${bookBannerTextStyle}
  font-weight: bold;
  display: inline-block;
  margin: 1rem 0 0 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;


  ${theme.breakpoints.mobile(css`
    line-height: 2.2rem;
    margin-top: 0.3rem;
  `)}
`;

const blue = `${theme.color.primary.blue.base}`;
const color = Color(blue).lighten(0.7);

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 13rem;
  background: linear-gradient(to right, ${blue}, ${color.hex()});

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
    height: 10.4rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export class BookBanner extends Component<PropTypes> {
  public render() {
    const {page, book} = this.props as PropTypes;

    if (!book || !page) {
      return null;
    }

    const treeSection = findArchiveTreeSection(book, page.id);
    const bookUrl = bookDetailsUrl(book);

    if (!treeSection) {
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
