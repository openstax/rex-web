// tslint:disable:variable-name
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled/macro';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page } from '../types';
import { scrollTocSectionIntoView, stripIdVersion } from '../utils';
import ContentLink from './ContentLink';

const sidebarOpenWidth = 300;
const sidebarClosedWidth = 40;
const sidebarClosedOffset = sidebarOpenWidth - sidebarClosedWidth;
const sidebarTransitionTime = 300;
const sidebarControlSize = 40;
const sidebarPadding = 10;

const SidebarPlaceholder = styled.div<{isOpen: boolean}>`
  background-color: white;
  overflow-x: hidden;
  transition: all ${sidebarTransitionTime}ms;

  width: ${(props) => props.isOpen ? sidebarOpenWidth : sidebarClosedWidth}px;
`;

const SidebarControl = styled(({isOpen, ...props}: React.HTMLProps<HTMLButtonElement> & {isOpen: boolean}) =>
  <button {...props}>
    <span></span>
    <span></span>
    <span></span>
  </button>
)`
  position: fixed;
  top: ${sidebarPadding}px;
  height: ${sidebarControlSize}px;
  width: ${sidebarControlSize}px;
  background: none;
  padding: 0;
  border: none;
  z-index: 1;
  outline: none;
  transition: all ${sidebarTransitionTime}ms;
  transform: translateX(0px);

  span {
    width: 100%;
    background: #000;
    padding-top: 10%;
    display: block;
    visibility: visible;
    opacity: 1;
    transition: all ${sidebarTransitionTime}ms;
  }

  ${(props) => !props.isOpen && `
    left: ${sidebarOpenWidth - sidebarControlSize - sidebarPadding}px;

    transform: translateX(-${sidebarClosedOffset}px);
    span {
      margin-top: 15%;
    }
  `}

  ${(props) => props.isOpen && `
    // extra padding on the left for scroll bars when open
    left: ${sidebarOpenWidth - sidebarControlSize - sidebarPadding - 10}px;

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

const SidebarBody = styled.div<{isOpen: boolean}>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${sidebarOpenWidth}px;
  overflow-y: auto;
  font-size: 15px;
  padding: ${sidebarPadding}px;
  transition: all ${sidebarTransitionTime}ms;
  transform: translateX(0px);

  ol {
    padding-inline-start: 10px;
  }

  > * {
    transition-property: visibility;
    transition-delay: 0s;
    visibility: visible;
  }

  ${(props) => !props.isOpen && `
    transform: translateX(-${sidebarClosedOffset}px);

    background-color: #ccc;
    overflow-y: hidden;

    > :not(${SidebarControl}) {
      transition-delay: ${sidebarTransitionTime}ms;
      visibility: hidden;
    }
  `}
`;

const NavItemComponent: ComponentType<{active?: boolean, className?: string}> = React.forwardRef(
  ({active, className, children}, ref) => <li
    ref={ref}
    className={className}
    {...(active ? {'aria-label': 'Current Page'} : {})}
  >{children}</li>
);

const NavItem = styled(NavItemComponent)`
  list-style: none;

  ${(props) => props.active && `
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
  isOpen: boolean;
  book?: Book;
  page?: Page;
  openToc: typeof actions['openToc'];
  closeToc: typeof actions['closeToc'];
}

export class Sidebar extends Component<SidebarProps> {
  public sidebar: HTMLElement | undefined;
  public activeSection: HTMLElement | undefined;

  public render() {
    const {isOpen, book, closeToc, openToc} = this.props;
    return <SidebarPlaceholder isOpen={isOpen}>
      <SidebarControl
        isOpen={isOpen}
        onClick={() => isOpen ? closeToc() : openToc()}
        role='button'
        aria-label={`Click to ${isOpen ? 'close' : 'open'} the Table of Contents`}
      />
      <SidebarBody isOpen={isOpen} ref={(ref: any) => this.sidebar = ref}>
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
    if (!this.props.isOpen) {
      return;
    }

    scrollTocSectionIntoView(this.sidebar, this.activeSection);
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
    isOpen: selectors.tocOpen(state),
    page: selectors.page(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc: (...args) => dispatch(actions.closeToc(...args)),
    openToc: (...args) => dispatch(actions.openToc(...args)),
  })
)(Sidebar);
