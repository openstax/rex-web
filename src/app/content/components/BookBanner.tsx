import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, h3Style, h4Style, textRegularLineHeight } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { findArchiveTreeSection } from '../utils/archiveTreeUtils';
import { bookDetailsUrl } from '../utils/urlUtils';
import { bookBannerDesktopHeight, bookBannerMobileHeight, contentTextWidth } from './constants';

const gradients: {[key in Book['theme']]: string} = {
  blue: '#004aa2',
  gray: '#97999b',
  green: '#9cd14a',
  yellow: '#faea36',
};

const applyBookTextColor = (props: {theme: Book['theme']}) => css`
  color: ${theme.color.primary[props.theme].foreground};
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  margin-left: -0.6rem;
  height: 3rem;
  width: 3rem;
  ${applyBookTextColor}
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
  max-width: ${maxNavWidth - (maxNavWidth - contentTextWidth) / 2}rem;
  padding: 0;
  ${applyBookTextColor}
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  ${bookBannerTextStyle}
  display: flex;
  height: ${textRegularLineHeight}rem;
  font-weight: normal;
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

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div<{theme: Book['theme']}>`
  position: sticky;
  top: 0;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: ${bookBannerDesktopHeight}rem;
  ${(props: {theme: Book['theme']}) => css`
    background: linear-gradient(to right, ${theme.color.primary[props.theme].base}, ${gradients[props.theme]});
  `}

  z-index: 3; /* stay above book content and overlay */
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

    return <BarWrapper theme={book.theme}>
      <TopBar>
        <BookTitle href={bookUrl} theme={book.theme}><LeftArrow theme={book.theme} />{book.tree.title}</BookTitle>
        <BookChapter theme={book.theme} dangerouslySetInnerHTML={{__html: treeSection.title}}></BookChapter>
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
