// tslint:disable:variable-name
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import theme from '../../theme';
import { AppState } from '../../types';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page } from '../types';
import { scrollTocSectionIntoView, stripIdVersion } from '../utils';
import ContentLink from './ContentLink';

export const sidebarWidth = 33.5;
const sidebarTransitionTime = 300;
const sidebarPadding = 1;

// TODO - magic numbers to be replaced in `top`, `height` when ToC gets real styling in openstax/unified#176
const SidebarBody = styled.div<{isOpen: boolean}>`
  top: 23rem;
  height: calc(100vh - 23rem);
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

  width: ${sidebarWidth}rem;
  position: sticky;

  ${theme.breakpoints.mobile(css`
    // TODO - in here the sidebar should overlap the content
    position: sticky;
  `)}

  ${(props) => !props.isOpen && css`
    overflow-y: hidden;
    margin-left: -${sidebarWidth}rem;

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
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  })
)(Sidebar);
