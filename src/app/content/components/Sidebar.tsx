// tslint:disable:variable-name
import { HTMLElement } from '@openstax/types/lib.dom';
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

const sidebarOpenWidth = 300;
const sidebarClosedWidth = 40;
const sidebarClosedOffset = sidebarOpenWidth - sidebarClosedWidth;

const SidebarPlaceholder = styled.div<{open: boolean}>`
  background-color: white;
  overflow-x: hidden;
  transition: all 300ms;
  width: ${sidebarClosedWidth}px;

  ${(props) => props.open && css`
    width: ${sidebarOpenWidth}px;
  `}
`;

const SidebarControl = styled(({open, ...props}: React.HTMLProps<HTMLButtonElement> & {open: boolean}) =>
  <button {...props}>
    <span></span>
    <span></span>
    <span></span>
  </button>
)`
  position: fixed;
  top: 10px;
  left: ${sidebarOpenWidth - 40}px;
  height: 40px;
  width: 40px;
  background: none;
  padding: 0;
  border: none;
  z-index: 1;
  outline: none;
  transition: all 300ms;
  transform: translateX(0px);

  span {
    width: 100%;
    background: #000;
    padding-top: 10%;
    display: block;
    visibility: visible;
    opacity: 1;
    transition: all 300ms;
  }

  ${(props) => !props.open && css`
    transform: translateX(-${sidebarClosedOffset}px);
    span {
      margin-top: 15%;
    }
  `}

  ${(props) => props.open && css`
    span:nth-child(1) {
      transform: rotateZ(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: rotateZ(-45deg);
      margin-top: -20%
    }
  `}

`;

const SidebarBody = styled.div<{open: boolean}>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${sidebarOpenWidth}px;
  overflow-y: auto;
  font-size: 15px;
  padding: 10px;
  transition: all 300ms;
  transform: translateX(0px);

  ol {
    padding-inline-start: 10px;
  }

  > * {
    transition-property: visibility;
    transition-delay: 0s;
    visibility: visible;
  }

  ${(props) => !props.open && css`
    transform: translateX(-${sidebarClosedOffset}px);

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

  ${(props) => props.active && css`
    overflow: visible;
    position: relative;

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
  public sidebar: HTMLElement | undefined;
  public activeSection: HTMLElement | undefined;

  public render() {
    const {open, book, closeToc, openToc} = this.props;
    return <SidebarPlaceholder open={open}>
      <SidebarControl
        open={open}
        onClick={() => open ? closeToc() : openToc()}
        role='button'
        aria-label={`Click to ${open ? 'close' : 'open'} the Table of Contents`}
      />
      <SidebarBody open={open} ref={(ref: any) => ref && (this.sidebar = ref)}>
        {this.renderLinks()}
        {book && this.renderToc(book)}
      </SidebarBody>
    </SidebarPlaceholder>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
  }

  public componentDidUpdate() {
    this.scrollToSelectedPage();
  }

  private scrollToSelectedPage() {
    const selectedLI = this.activeSection;
    const sidebar = this.sidebar;
    let selectedChapter: undefined | HTMLElement;

    if (!this.props.open || !selectedLI || !sidebar) {
      return;
    }

    // do nothing if the LI is already visible
    if (selectedLI.offsetTop > sidebar.scrollTop &&  selectedLI.offsetTop - sidebar.scrollTop < sidebar.offsetHeight) {
      return;
    }

    let search = selectedLI.parentElement;
    while (search && !selectedChapter && search !== sidebar) {
      if (search.nodeName === 'LI') {
        selectedChapter = search;
      }
      search = search.parentElement;
    }

    const chapterSectionDelta = selectedChapter && (selectedLI.offsetTop - selectedChapter.offsetTop);
    const scrollTarget = chapterSectionDelta && (chapterSectionDelta < sidebar.offsetHeight)
      ? selectedChapter
      : selectedLI;

    if (scrollTarget) {
      sidebar.scrollTo(0, scrollTarget.offsetTop);
    }
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
      {contents.map((item) => {
        const active = (!!this.props.page) && stripIdVersion(item.id) === this.props.page.id;

        return isArchiveTree(item)
          ? <NavItem key={item.id}>
              <h3 dangerouslySetInnerHTML={{__html: item.title}} />
              {this.renderTocNode(book, item)}
            </NavItem>
          : <NavItem
              key={item.id}
              ref={active ? ((ref: any) => this.activeSection = ref) : undefined}
              active={active}
            >
              <ContentLink book={book} page={item} dangerouslySetInnerHTML={{__html: item.title}} />
            </NavItem>;
      })}
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
