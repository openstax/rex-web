// tslint:disable:variable-name
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page } from '../types';
import { scrollTocSectionIntoView, stripIdVersion } from '../utils';
import ContentLink from './ContentLink';

export const sidebarWidth = 33.5;
const sidebarTransitionTime = 300;
const sidebarPadding = 1;

const sidebarPositionBreak = '64em';

const SidebarBody = styled.div<{isOpen: boolean}>`
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: ${sidebarPadding}rem;
  transition: all ${sidebarTransitionTime}ms;
  background-color: ${theme.color.neutral.darker};

  ol {
    padding-inline-start: 10px;
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    visibility: visible;
    opacity: 1;
  }

  width: 33.5rem;

  @media (max-width: ${sidebarPositionBreak}) {
    // TODO - in here the sidebar should overlap the content
    position: sticky;
  }

  @media (min-width: ${sidebarPositionBreak}) {
    position: sticky;
  }

  ${(props) => !props.isOpen && css`
    overflow-y: hidden;
    margin-left: -33.5rem;

    > * {
      visibility: hidden;
      opacity: 0;
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
  font-size: 1.4rem;

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
    const {isOpen, book} = this.props;
    return <SidebarBody isOpen={isOpen} ref={(ref: any) => this.sidebar = ref}>
      {book && this.renderToc(book)}
    </SidebarBody>;
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
      <FormattedMessage id='i18n:toc:title'>
        {(txt) => (
          <h2>{txt}</h2>
        )}
      </FormattedMessage>
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
