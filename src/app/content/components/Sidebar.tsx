import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import Times from '../../components/Times';
import { textStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { resetToc } from '../actions';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page, State } from '../types';
import { splitTitleParts } from '../utils/archiveTreeUtils';
import { scrollTocSectionIntoView } from '../utils/domUtils';
import { stripIdVersion } from '../utils/idUtils';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight
} from './constants';
import ContentLinkComponent from './ContentLink';
import { CloseSidebarControl, ToCButtonText } from './SidebarControl';
import { toolbarIconStyles } from './Toolbar';
import { disablePrint } from './utils/disablePrint';
import { styleWhenSidebarClosed } from './utils/sidebar';

const sidebarPadding = 1.8;
const numberCharacterWidth = 0.8;
const numberPeriodWidth = 0.2;
const iconPadding = 0;
const iconSize = 1.7;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-${sidebarDesktopWidth}rem);
  box-shadow: none;
  background-color: transparent;

  > * {
    visibility: hidden;
    opacity: 0;
  }

  ${theme.breakpoints.mobile(css`
    background-color: ${theme.color.neutral.darker};
    transform: translateX(-${sidebarMobileWidth + sidebarPadding * 2}rem);

    > * {
      visibility: visible;
      opacity: 1;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const SidebarBody = styled.div<{isOpen: State['tocOpen']}>`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  margin-top: -${toolbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  transition:
    transform ${sidebarTransitionTime}ms ease-in-out,
    box-shadow ${sidebarTransitionTime}ms ease-in-out,
    background-color ${sidebarTransitionTime}ms ease-in-out;
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
    top: ${bookBannerMobileMiniHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
  `)}

  display: flex;
  flex-direction: column;

  > ol {
    -webkit-overflow-scrolling: touch;
    position: relative;
    padding: ${sidebarPadding}rem ${sidebarPadding}rem ${sidebarPadding}rem 0.2rem;
    flex: 1;

    ::before {
      content: "";
      background: ${theme.color.neutral.darker};
      display: block;
      height: ${sidebarPadding}rem;
      margin: -${sidebarPadding}rem -${sidebarPadding}rem 0 -${sidebarPadding}rem;
    }
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    visibility: visible;
    opacity: 1;
  }

  ${styleWhenSidebarClosed(sidebarClosedStyle)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${toolbarDesktopHeight}rem;
  overflow: visible;
  box-shadow: 0 1rem 1rem -1rem rgba(0, 0, 0, 0.14);
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  margin-right: 0;
  padding-right: 0;
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
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
const SummaryTitle = styled.span`
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: normal;
  width: 100%;
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
const ContentLink = styled(ContentLinkComponent)`
  ${textStyle}
  display: flex;
  margin-left: ${iconPadding + iconSize}rem;
  text-decoration: none;

  li[aria-label="Current Page"] & {
    font-weight: bold;
  }

`;

// tslint:disable-next-line:variable-name
const NavItem = styled(NavItemComponent)`
  ${textStyle}
  list-style: none;
  font-size: 1.4rem;
  line-height: 1.6rem;
  overflow: visible;
  margin: 0 0 1.5rem 0;

  ${SummaryTitle}, ${ContentLink} {
    :hover {
      color: ${theme.textColors.black}
    }
  }

`;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
  margin-right: ${iconPadding}rem;
`;

// tslint:disable-next-line:variable-name
const ExpandIcon = styled(CaretRight)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
const CollapseIcon = styled(CaretDown)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  display: flex;
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, {title}) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }

  const numbers = num.replace(/[^0-9]/, '');
  const periods = num.replace(/[^\.]/, '');

  return Math.max(result, numbers.length * numberCharacterWidth + periods.length * numberPeriodWidth);
}, 0);

const getDividerWidth = (section: ArchiveTree) => {

  if (section.title.includes(' | ')) {
    return 0.6;
  }

  return 0.4;

};

// tslint:disable-next-line:variable-name
const NavOl = styled.ol<{section: ArchiveTree}>`
  margin: 0;
  padding: 0rem 3rem 0 0;

  .os-number,
  .os-divider,
  .os-text {
    display: inline-block;
    overflow: hidden;
  }

  ${SummaryTitle} {
    display: flex;
  }

  ${(props) => {
    const numberWidth = getNumberWidth(props.section.contents);
    const dividerWidth = getDividerWidth(props.section);

    return css`
      .os-number {
        width: ${numberWidth}rem;
      }

      .os-divider {
        width: ${dividerWidth}rem;
      }

      .os-text {
        flex: 1;
      }

      ol {
        margin-left: ${numberWidth + 0.5}rem;
      }
    `;
  }}
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  border: none;
  overflow: visible;

  &[open] ${ExpandIcon} {
    display: none;
  }

  &:not([open]) ${CollapseIcon} {
    display: none;
  }

  ${NavItem} {
    margin-bottom: 1.2rem;

    :first-child {
      margin-top: 1.5rem;
    }

    :last-child {
      margin-bottom: 0;
    }
  }
`;

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
    return <SidebarBody isOpen={isOpen} ref={this.sidebar} aria-label='Table of Contents'>
      {this.renderTocHeader()}
      {book && this.renderToc(book)}
    </SidebarBody>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
    this.expandCurrentChapter();

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

  public componentDidUpdate() {
    this.scrollToSelectedPage();
    this.expandCurrentChapter();
  }

  private scrollToSelectedPage() {
    scrollTocSectionIntoView(this.sidebar.current, this.activeSection.current);
  }

  private expandCurrentChapter() {

    if (typeof(document) === 'undefined' || typeof(window) === 'undefined') {
      return;
    }

    const currentChapter = this.activeSection.current;
    let parent: HTMLElement;
    let counter = 1;

    if ( currentChapter && currentChapter.parentElement) {
      parent = currentChapter.parentElement;

      while ( parent.getAttribute('aria-label') !== 'Table of Contents'
        && counter < 10) {
        console.log(parent);

        if ( parent.tagName === 'DETAILS'
          && !parent.hasAttribute('open')
        ) {
          parent.setAttribute('open', '');
        }

        if ( parent.parentElement ) {
          parent = parent.parentElement;
        } else {
          return null;
        }
        counter++;

      }
    }
  }

  private renderChildren = (book: Book, section: ArchiveTree) =>
    <NavOl section={section}>
      {section.contents.map((item) => {
        const active = (!!this.props.page) && stripIdVersion(item.id) === this.props.page.id;
        return isArchiveTree(item)
        ? <NavItem>{this.renderTocNode(book, item)}</NavItem>
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
    </NavOl>

  private renderTocNode = (book: Book, node: ArchiveTree) =>
    <Details ref={this.container}>
      <Summary>
        <ExpandIcon/>
        <CollapseIcon/>
        <SummaryTitle dangerouslySetInnerHTML={{__html: node.title}}/>
      </Summary>
      {this.renderChildren(book, node)}
    </Details>

  private renderTocHeader = () =>
    <ToCHeader>
      <SidebarHeaderButton><TimesIcon /></SidebarHeaderButton>
    </ToCHeader>

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
