import { HTMLDivElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { disablePrint } from '../../components/Layout';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, h3Style, h4Style, textRegularLineHeight } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertDocument } from '../../utils';
import * as select from '../selectors';
import { ArchiveTreeSection, Book, Page } from '../types';
import { findArchiveTreeSection } from '../utils/archiveTreeUtils';
import { bookDetailsUrl } from '../utils/urlUtils';
import {
  bookBannerDesktopBigHeight,
  bookBannerDesktopMiniHeight,
  bookBannerMobileBigHeight,
  bookBannerMobileMiniHeight,
  contentTextWidth
} from './constants';

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
  margin-left: -0.8rem;
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

type Style = string | number | FlattenSimpleInterpolation;
const ifMiniNav = (miniStyle: Style, bigStyle?: Style) =>
  (props: {variant: 'mini' | 'big'}) =>
    props.variant === 'mini' ? miniStyle : bigStyle;

// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  ${bookBannerTextStyle}
  display: ${ifMiniNav('inline-flex', 'flex')};
  height: ${textRegularLineHeight}rem;
  font-weight: normal;
  align-items: center;
  text-decoration: none;
  margin: 0;

  :hover {
    text-decoration: underline;
  }

  ${ifMiniNav(css`
    width: 27rem;

    ${theme.breakpoints.mobile(css`
      display: none;
    `)}
  `)}
`;

// tslint:disable-next-line:variable-name
const BookChapter = styled((props) => props.variant === 'mini' ? <span {...props} /> : <h1 {...props} />)`
  ${ifMiniNav(h4Style, h3Style)}
  ${bookBannerTextStyle}
  font-weight: bold;
  display: ${ifMiniNav('inline-block', 'block')};
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
export const BarWrapper = styled.div<{theme: Book['theme'], up: boolean, variant: 'mini' | 'big'}>`
  top: 0;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: ${ifMiniNav(bookBannerDesktopMiniHeight, bookBannerDesktopBigHeight)}rem;
  transition: transform 200ms;
  position: ${ifMiniNav('sticky', 'relative' /* stay above mini nav */)};
  z-index: ${ifMiniNav(3 /* stay above book content and overlay */, 4 /* above mini nav */)};
  ${(props: {theme: Book['theme']}) => css`
    background: linear-gradient(to right, ${theme.color.primary[props.theme].base}, ${gradients[props.theme]});
  `}
  ${(props) => props.up && css`
    transform: translateY(-${bookBannerDesktopMiniHeight}rem);
    ${theme.breakpoints.mobile(css`
      transform: translateY(-${bookBannerMobileMiniHeight}rem);
    `)}
  `}

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
    height: ${ifMiniNav(bookBannerMobileMiniHeight, bookBannerMobileBigHeight)}rem;
    ${ifMiniNav(`margin-top: -${bookBannerMobileMiniHeight}rem`)}
  `)}

  ${ifMiniNav(`margin-top: -${bookBannerDesktopMiniHeight}rem`)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export class BookBanner extends Component<PropTypes, {scrollTransition: boolean}> {
  public state = {
    scrollTransition: false,
  };
  private miniBanner = React.createRef<HTMLDivElement>();
  private bigBanner = React.createRef<HTMLDivElement>();

  public handleScroll = () => {
    if (this.miniBanner.current && this.bigBanner.current && typeof(window) !== 'undefined') {
      const miniRect = this.miniBanner.current.getBoundingClientRect();
      this.setState({
        scrollTransition: miniRect.top === 0 &&
          this.bigBanner.current.offsetTop + this.bigBanner.current.clientHeight > window.scrollY,
      });
    }
  }

  public componentDidMount() {
    const document = assertDocument();
    document.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }

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

    return this.renderBars(book, bookUrl, treeSection);
  }

  private renderBars = (book: Book, bookUrl: string, treeSection: ArchiveTreeSection) => ([
    <BarWrapper theme={book.theme} key='expanded-nav' up={this.state.scrollTransition} ref={this.bigBanner}>
      <TopBar>
        <BookTitle href={bookUrl} theme={book.theme}><LeftArrow theme={book.theme} />{book.tree.title}</BookTitle>
        <BookChapter theme={book.theme} dangerouslySetInnerHTML={{__html: treeSection.title}} />
      </TopBar>
    </BarWrapper>,
    <BarWrapper theme={book.theme} variant='mini' key='mini-nav' ref={this.miniBanner}>
      <TopBar>
        <BookTitle href={bookUrl} variant='mini' theme={book.theme}>
          <LeftArrow theme={book.theme} />{book.tree.title}
        </BookTitle>
        <BookChapter theme={book.theme} variant='mini' dangerouslySetInnerHTML={{__html: treeSection.title}} />
      </TopBar>
    </BarWrapper>,
  ])
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(BookBanner);
