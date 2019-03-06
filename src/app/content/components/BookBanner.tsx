import React, { Component } from 'react';
import { connect } from 'react-redux';
import withServices from '../../context/Services';
import styled from 'styled-components';
import theme from '../../theme';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import {ChevronLeft} from 'styled-icons/boxicons-regular/ChevronLeft'
import { findArchiveTreeSection, bookDetailsUrl } from '../utils'
import Color from 'color';
import typography from '../../components/Typography';

const LeftArrow = styled(ChevronLeft)`
  height: 2rem;
  width: 2rem;
  color: #FFFFFF;
  margin-right: 0.7rem;
`;

interface PropTypes {
  page?: Page;
  book?: Book;
  services: AppServices;
}

const TopBar = styled.div`
  width: 100%;
  max-width: 117rem;
  background: transparent;
  margin: 0 auto;
  text-align: left;
`;

const BookTitle = styled.a`
  ${typography.h4Style}
  letter-spacing: -0.04rem;
  color: ${theme.color.primary.blue.foreground};
  text-align: left;
  display: inline-block;
  width: 100%;
  max-width: 87rem;
  margin: 0;
  text-decoration: none;
`;

const BookChapter = styled.h3`
  ${typography.h3Style}
  letter-spacing: -0.04rem;
  color: ${theme.color.primary.blue.foreground};
  font-weight: bold;
  text-align: left;
  display: inline-block;
  width: 100%;
  max-width: 87rem;
  margin-top: 1rem;
  margin-bottom: 0;
`;

const blue = `${theme.color.primary.blue.base}`;
const color = Color(`${blue}`).lighten(0.7); 

const BarWrapper = styled.div`
  width: 100%;
  padding: ${theme.contentBuffer.default.padding};
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: 13rem;
  background: linear-gradient(to right, ${blue}, ${color.hex()});
`;

export class TitleComponent extends Component<PropTypes> {
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
)(withServices(TitleComponent));

