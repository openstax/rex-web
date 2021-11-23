import { HTMLElement, MediaQueryListEvent } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { closeMobileMenu, resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, Page, State } from '../../types';
import { archiveTreeContainsNode } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollSidebarSectionIntoView, setSidebarHeight } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CloseSidebarControl } from '../SidebarControl';
import { LeftArrow, TimesIcon } from '../Toolbar/styled';
import * as Styled from './styled';
import { ToCHeaderText } from './styled';

interface SidebarProps {
  onNavigate: () => void;
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

// tslint:disable-next-line:variable-name
const SidebarBody = React.forwardRef<HTMLElement, React.ComponentProps<typeof Styled.SidebarBody>>(
  (props, ref) => <Styled.SidebarBody
    ref={ref}
    data-testid='toc'
    aria-label={useIntl().formatMessage({id: 'i18n:toc:title'})}
    data-analytics-region='toc'
    {...props}
  />
);

export class TableOfContents extends Component<SidebarProps, { isMediumMobile: boolean }> {
  public sidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();

  constructor(props: SidebarProps) {
    super(props);
    this.state = { isMediumMobile: false };
  }

  public render() {
    const {isOpen, book} = this.props;

    return <SidebarBody isTocOpen={isOpen} ref={this.sidebar}>
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

    const matchMedia = window.matchMedia(theme.breakpoints.mobileMediumQuery);
    matchMedia.addEventListener('change', this.checkIfMediumMobile);
    this.setState({ isMediumMobile: matchMedia.matches });

    const {callback, deregister} = setSidebarHeight(sidebar, window);
    callback();

    this.deregister = () => {
      deregister();
      matchMedia.removeEventListener('change', this.checkIfMediumMobile);
    };
  }

  public componentDidUpdate(prevProps: SidebarProps) {
    if (this.props.page !== prevProps.page) {
      expandCurrentChapter(this.activeSection.current);
      this.scrollToSelectedPage();
    }
  }

  public componentWillUnmount() {
    this.deregister();
  }
  private deregister: () => void = () => null;

  private checkIfMediumMobile = (e: MediaQueryListEvent) => {
    if (e.matches) {
      this.setState({ isMediumMobile: true });
    } else {
      this.setState({ isMediumMobile: false });
    }
  };

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(this.sidebar.current, this.activeSection.current);
  }

  private renderChildren = (book: Book, section: ArchiveTree) =>
    <Styled.NavOl section={section}>
      {section.contents.map((item) => {
        const active = this.props.page && stripIdVersion(item.id) === this.props.page.id;
        return isArchiveTree(item)
        ? <Styled.NavItem key={item.id}>{this.renderTocNode(book, item)}</Styled.NavItem>
        : <Styled.NavItem
          key={item.id}
          ref={active ? this.activeSection : null}
          active={active}
        >
          <Styled.ContentLink
            onClick={this.props.onNavigate}
            book={book}
            page={item}
            dangerouslySetInnerHTML={{__html: item.title}}
          />
        </Styled.NavItem>;
      })}
    </Styled.NavOl>;

  private renderTocNode = (book: Book, node: ArchiveTree) => <Styled.NavDetails
    {...this.props.page && archiveTreeContainsNode(node, this.props.page.id)
        ? {defaultOpen: true}
        : {}
    }
  >
    <Styled.Summary>
      <Styled.SummaryWrapper>
        <Styled.ExpandIcon/>
        <Styled.CollapseIcon/>
        <Styled.SummaryTitle dangerouslySetInnerHTML={{__html: node.title}}/>
      </Styled.SummaryWrapper>
    </Styled.Summary>
    {this.renderChildren(book, node)}
  </Styled.NavDetails>;

  private renderTocHeader = () => {
    if (this.state.isMediumMobile) {
      return <Styled.ToCHeader data-testid='tocheader'>
      <CloseSidebarControl><LeftArrow /></CloseSidebarControl>
      <FormattedMessage id='i18n:toc:title'>
        {(msg) => <ToCHeaderText>{msg}</ToCHeaderText>}
      </FormattedMessage>
      <Styled.CloseToCAndMobileMenuButton />
    </Styled.ToCHeader>;
    }
    return <Styled.ToCHeader data-testid='tocheader'>
      <FormattedMessage id='i18n:toc:title'>
        {(msg) => <ToCHeaderText>{msg}</ToCHeaderText>}
      </FormattedMessage>
      <CloseSidebarControl><TimesIcon /></CloseSidebarControl>
    </Styled.ToCHeader>;
  };

  private renderToc = (book: Book) => this.renderChildren(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    onNavigate: () => {
      dispatch(resetToc());
      dispatch(closeMobileMenu());
    },
  })
)(TableOfContents);
