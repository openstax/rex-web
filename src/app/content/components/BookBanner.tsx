import { Element } from '@openstax/types/lib.dom';
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
  margin: 1rem 0 0 0;
  overflow: hidden;

  ${theme.breakpoints.mobile(css`
    max-height: 4.4rem;
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
  public chapter: undefined | Element;

  public componentDidMount() {
    if (!window) {
      return;
    }
    window.addEventListener('resize', this.setTruncation.bind(this));
  }

  public componentDidUpdate() {
    this.setTruncation();
  }

  public isTruncated(chapter: undefined | Element): chapter is Element {
    return chapter !== undefined && chapter.scrollHeight > chapter.clientHeight;
  }

  public setTruncation() {
    if (!this.chapter) {
      return;
    }
    const title = this.chapter.querySelector('.os-text');
    if (!title) {
      return;
    }

    const unTruncated = title.hasAttribute('data-untruncated')
      ? title.getAttribute('data-untruncated')
      : title.textContent;

    title.setAttribute('data-untruncated', unTruncated || '');
    title.textContent = unTruncated || '';

    while (this.isTruncated(this.chapter)) {
      title.textContent = title.textContent.slice(0, -4) + '...';
    }
  }

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
        <BookChapter
          ref={(ref: any) => this.chapter = ref}
          dangerouslySetInnerHTML={{__html: treeSection.title}}
        ></BookChapter>
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
