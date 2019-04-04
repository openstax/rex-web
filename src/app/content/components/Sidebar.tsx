import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import Times from '../../components/Times';
import theme from '../../theme';
import { AppState } from '../../types';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page, State } from '../types';
import { scrollTocSectionIntoView } from '../utils/domUtils';
import { stripIdVersion } from '../utils/idUtils';
import {
  bookBannerDesktopHeight,
  bookBannerMobileHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight,
  toolbarMobileHeight
} from './constants';
import ContentLink from './ContentLink';
import { CloseSidebarControl, ToCButtonText } from './SidebarControl';
import { toolbarIconStyles } from './Toolbar';
import { styleWhenSidebarClosed } from './utils/sidebar';

const sidebarPadding = 1;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-${sidebarDesktopWidth}rem);
  box-shadow: none;
  background-color: transparent;
  ${theme.breakpoints.mobile(css`
    transform: translateX(-${sidebarMobileWidth}rem);
  `)}

  > * {
    visibility: hidden;
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
const SidebarBody = styled.div<{isOpen: State['tocOpen']}>`
  position: sticky;
  top: ${bookBannerDesktopHeight}rem;
  margin-top: -${toolbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopHeight}rem);
  transition:
    transform ${sidebarTransitionTime}ms,
    box-shadow ${sidebarTransitionTime}ms,
    background-color ${sidebarTransitionTime}ms;
  background-color: ${theme.color.neutral.darker};
  z-index: 3; /* stay above book content and overlay */
  margin-left: -50vw;
  padding-left: 50vw;
  width: calc(50vw + ${sidebarDesktopWidth}rem);
  min-width: calc(50vw + ${sidebarDesktopWidth}rem);
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${sidebarMobileWidth}rem);
    min-width: calc(50vw + ${sidebarMobileWidth}rem);
    margin-top: -${toolbarMobileHeight}rem;
    top: ${bookBannerMobileHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileHeight}rem);
  `)}

  ol {
    padding-inline-start: 10px;
  }

  display: flex;
  flex-direction: column;

  > nav {
    -webkit-overflow-scrolling: touch;
    position: relative;
    padding: ${sidebarPadding}rem;
    flex: 1;
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    visibility: visible;
    opacity: 1;
  }

  ${styleWhenSidebarClosed(sidebarClosedStyle)}
`;

// tslint:disable-next-line:variable-name
const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${toolbarDesktopHeight}rem;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  margin-right: 0;
  padding-right: 0;
`;

// tslint:disable-next-line:variable-name
const SidebarHeaderButton = styled((props) => <CloseSidebarControl {...props} />)`
  display: flex;
  margin-right: ${sidebarPadding}rem;
  flex: 1;

  ${ToCButtonText} {
    flex: 1;
    text-align: left;
  }

  ${ToCHeader} {
    flex: 1;
    text-align: left;
  }
`;

// tslint:disable-next-line:variable-name
const NavItemComponent: ComponentType<{active?: boolean, className?: string}> = React.forwardRef(
  ({active, className, children}, ref) => <li
    ref={ref}
    className={className}
    {...(active ? {'aria-label': 'Current Page'} : {})}
  >{children}</li>
);

// tslint:disable-next-line:variable-name
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
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

export class Sidebar extends Component<SidebarProps> {
  public sidebar: HTMLElement | undefined;
  public activeSection: HTMLElement | undefined;

  public render() {
    const {isOpen, book} = this.props;
    return <SidebarBody isOpen={isOpen} ref={(ref: any) => this.sidebar = ref} aria-label='Table of Contents'>
      {this.renderTocHeader()}
      {book && this.renderToc(book)}
    </SidebarBody>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();

    const sidebar = this.sidebar;

    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandler = () => {
      const top = sidebar.getBoundingClientRect().top;
      sidebar.style.setProperty('height', `calc(100vh - ${top}px)`);
    };

    const animation = () => requestAnimationFrame(scrollHandler);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
  }

  public componentDidUpdate() {
    this.scrollToSelectedPage();
  }

  private scrollToSelectedPage() {
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

  private renderTocHeader = () => <ToCHeader>
    <SidebarHeaderButton><TimesIcon /></SidebarHeaderButton>
  </ToCHeader>

  private renderToc = (book: Book) => this.renderTocNode(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  })
)(Sidebar);
