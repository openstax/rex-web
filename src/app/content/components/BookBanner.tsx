import Color from 'color';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, h3Style, h4Style } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { bookDetailsUrl, findArchiveTreeSection } from '../utils';

export const bookBannerDesktopHeight = 13;
export const bookBannerMobileHeight = 10.4;

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
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
`;

const bookBannerTextStyle = css`
  max-width: 87rem;
  padding: 0;
  color: ${theme.color.primary.blue.foreground};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  ${bookBannerTextStyle}
  font-weight: normal;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  margin: 0;

  :hover {
    text-decoration: underline;
  }
`;

// tslint:disable-next-line:variable-name
const BookChapter = styled.h1`
  ${h3Style}
  ${bookBannerTextStyle}
  font-weight: bold;
  display: block;
  margin: 1rem 0 0 0;

  ${theme.breakpoints.mobile(css`
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    max-height: ${h3MobileLineHeight * 2}rem;
    margin-top: 0.3rem;
  `)}
`;

const blue = `${theme.color.primary.blue.base}`;
const color = Color(blue).lighten(0.7);

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  position: sticky;
  top: 0;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: ${bookBannerDesktopHeight}rem;
  background: linear-gradient(to right, ${blue}, ${color.hex()});
  z-index: 2; /* stay above book content */

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
    height: ${bookBannerMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export class BookBanner extends Component<PropTypes> {

  public render() {
    const {page, book} = this.props;

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
