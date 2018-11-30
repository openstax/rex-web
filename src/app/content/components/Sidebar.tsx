// tslint:disable:variable-name
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page } from '../types';
import { stripIdVersion } from '../utils';
import ContentLink from './ContentLink';

const SidebarPlaceholder = styled.div<{open: boolean}>`
  background-color: white;
  overflow-x: hidden;
  transition: all 300ms;
  width: 40px;

  ${(props) => props.open && css`
    width: 300px;
  `}
`;

const SidebarControl = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  height: 20px;
  width: 20px;
`;

const SidebarBody = styled.div<{open: boolean}>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  overflow-y: auto;
  font-size: 15px;
  transition: all 300ms;
  padding: 10px;

  ol {
    padding-inline-start: 10px;
  }

  > * {
    transition-property: visibility;
    transition-delay: 0s;
    visibility: visible;
  }

  ${(props) => !props.open && css`
    left: -280px;
    background-color: #ccc;
    overflow-y: hidden;
    > :not(${SidebarControl}) {
      transition-delay: 300ms;
      visibility: hidden;
    }
  `}
`;

const NavItem = styled.li<{active?: boolean}>`
  list-style: none;
  position: relative;

  ${(props) => props.active && css`
    :before {
      font-weight: bold;
      content: '>';
      position: absolute;
      right: 100%;
    }
  `}
`;

interface SidebarProps {
  open: boolean;
  book?: Book;
  page?: Page;
  openToc: typeof actions['openToc'];
  closeToc: typeof actions['closeToc'];
}

export class Sidebar extends Component<SidebarProps> {

  public render() {
    const {open, book, closeToc, openToc} = this.props;
    return <SidebarPlaceholder open={open}>
      <SidebarBody open={open}>
        <SidebarControl
          onClick={() => open ? closeToc() : openToc()}
          role='button'
          aria-label={`Click to ${open ? 'close' : 'open'} the Table of Contents`}
        />
        {this.renderLinks()}
        {book && this.renderToc(book)}
      </SidebarBody>
    </SidebarPlaceholder>;
  }

  private renderLinks = () => {
    return <nav>
      <ol>
        <NavItem>
          <a href='#'>book details</a>
        </NavItem>
      </ol>
    </nav>;
  }

  private renderTocNode = (book: Book, {contents}: ArchiveTree) => <nav>
    <ol>
      {contents.map((item) => isArchiveTree(item)
        ? <NavItem key={item.id}>
          <h3 dangerouslySetInnerHTML={{__html: item.title}} />
          {this.renderTocNode(book, item)}
        </NavItem>
        : <NavItem key={item.id} active={(!!this.props.page) && stripIdVersion(item.id) === this.props.page.id}>
          <ContentLink book={book} page={item} dangerouslySetInnerHTML={{__html: item.title}} />
        </NavItem>
      )}
    </ol>
  </nav>

  private renderToc = (book: Book) => {
    return <div>
      <h2>Table of Contents</h2>
      {this.renderTocNode(book, book.tree)}
    </div>;
  }
}

export default connect(
  (state: AppState) => ({
    book: selectors.book(state),
    open: selectors.tocOpen(state),
    page: selectors.page(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc: (...args) => dispatch(actions.closeToc(...args)),
    openToc: (...args) => dispatch(actions.openToc(...args)),
  })
)(Sidebar);
