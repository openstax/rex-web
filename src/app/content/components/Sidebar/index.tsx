import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import { resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, Page, State } from '../../types';
import { archiveTreeContainsSection } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollTocSectionIntoView } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import {
  CollapseIcon,
  ContentLink,
  Details,
  ExpandIcon,
  NavItem,
  NavOl,
  SidebarBody,
  SidebarHeaderButton,
  Summary,
  SummaryTitle,
  TimesIcon,
  ToCHeader
} from './styled';

interface SidebarProps {
  onNavigate: () => void;
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

export class Sidebar extends Component<SidebarProps> {
  public sidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public container = React.createRef<HTMLElement>();

  public render() {
    const {isOpen, book} = this.props;
    return <SidebarBody isOpen={isOpen} ref={this.sidebar} data-testid='toc' aria-label='Table of Contents'>
      {this.renderTocHeader()}
      {book && this.renderToc(book)}
    </SidebarBody>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
    const sidebar = this.sidebar.current;

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
    scrollHandler();
  }

  public componentDidUpdate(prevProps: SidebarProps) {
    if (this.props.page !== prevProps.page) {
      expandCurrentChapter(this.activeSection.current);
      this.scrollToSelectedPage();
    }
  }

  private scrollToSelectedPage() {
    scrollTocSectionIntoView(this.sidebar.current, this.activeSection.current);
  }

  private renderChildren = (book: Book, section: ArchiveTree) =>
    <NavOl section={section}>
      {section.contents.map((item) => {
        const active = this.props.page && stripIdVersion(item.id) === this.props.page.id;
        return isArchiveTree(item)
        ? <NavItem key={item.id}>{this.renderTocNode(book, item)}</NavItem>
        : <NavItem
          key={item.id}
          ref={active ? this.activeSection : null}
          active={active}
        >
          <ContentLink
            onClick={this.props.onNavigate}
            book={book}
            page={item}
            dangerouslySetInnerHTML={{__html: item.title}}
          />
        </NavItem>;
      })}
    </NavOl>;

  private renderTocNode = (book: Book, node: ArchiveTree) => <Details
    ref={this.container}
    {...this.props.page && archiveTreeContainsSection(node, this.props.page.id) ? {open: true} : {}}
  >
    <Summary>
      <ExpandIcon/>
      <CollapseIcon/>
      <SummaryTitle dangerouslySetInnerHTML={{__html: node.title}}/>
    </Summary>
    {this.renderChildren(book, node)}
  </Details>;

  private renderTocHeader = () =>
    <ToCHeader data-testid='tocheader'>
      <SidebarHeaderButton><TimesIcon /></SidebarHeaderButton>
    </ToCHeader>;

  private renderToc = (book: Book) => this.renderChildren(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    onNavigate: () => dispatch(resetToc()),
  })
)(Sidebar);
