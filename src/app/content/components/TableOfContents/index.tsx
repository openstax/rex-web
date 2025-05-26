import { HTMLElement, NodeListOf, Element } from '@openstax/types/lib.dom';
import React, { Component, MutableRefObject } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import { closeMobileMenu, resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import { linkContents } from '../../search/utils';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, LinkedArchiveTree, LinkedArchiveTreeSection, Page, State } from '../../types';
import { archiveTreeContainsNode, getArchiveTreeSectionType, splitTitleParts } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollSidebarSectionIntoView, setSidebarHeight } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CloseToCAndMobileMenuButton, TOCBackButton, TOCCloseButton } from '../SidebarControl';
import { Header, HeaderText, SidebarPaneBody } from '../SidebarPane';
import { LeftArrow, TimesIcon } from '../Toolbar/styled';
import * as Styled from './styled';
import { createTrapTab, useMatchMobileQuery, useMatchMobileMediumQuery, isSSR } from '../../../reactUtils';

interface SidebarProps {
  onNavigate: () => void;
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

function TabTrapper({
  mRef,
  isTocOpen,
}: {
  mRef: MutableRefObject<HTMLElement>;
  isTocOpen: boolean;
}) {
  const isPhone = useMatchMobileMediumQuery();
  const isMobile = useMatchMobileQuery();

  React.useEffect(() => {
    if (!mRef?.current) {
      return;
    }
    const otherRegions =
      document?.querySelectorAll(
        '[data-testid="navbar"],[data-testid="bookbanner"]'
      ) as NodeListOf<Element>;
    const containers = [
      mRef.current,
      ...(isPhone
        ? []
        : [mRef.current.previousElementSibling, ...Array.from(otherRegions)]),
    ];
    const listener = createTrapTab(...(containers as HTMLElement[]));
    if (isTocOpen && isMobile) {
      document?.addEventListener('keydown', listener, true);
    }

    return () => document?.removeEventListener('keydown', listener, true);
  }, [mRef, isTocOpen, isMobile, isPhone]);

  return null;
}

// tslint:disable-next-line:variable-name
const SidebarBody = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof SidebarPaneBody>
>((props, ref) => {
  const mRef = ref as MutableRefObject<HTMLElement>;

  React.useEffect(
    () => {
      const firstItemInToc = mRef?.current?.querySelector(
        ' div > div a, div > div div span'
      ) as HTMLElement;
      const el = mRef.current;
      const transitionListener = () => {
        firstItemInToc?.focus();
      };

      if (props.isTocOpen) {
        el?.addEventListener('transitionend', transitionListener);
      }

      return () => el?.removeEventListener('transitionend', transitionListener);
    },
    [props.isTocOpen, mRef]
  );

  return (
    <React.Fragment>
      {typeof window !== 'undefined' && (
        <TabTrapper
          mRef={mRef}
          isTocOpen={props.isTocOpen}
        />
      )}
      <SidebarPaneBody
        ref={ref}
        data-testid='toc'
        aria-label={useIntl().formatMessage({ id: 'i18n:toc:title' })}
        data-analytics-region='toc'
        {...props}
      />
    </React.Fragment>
  );
});

function TocHeader() {
  return (
    <Header data-testid='tocheader'>
      <TOCBackButton><LeftArrow /></TOCBackButton>
      <FormattedMessage id='i18n:toc:title'>
        {(msg) => <HeaderText>{msg}</HeaderText>}
      </FormattedMessage>
      <CloseToCAndMobileMenuButton />
      <TOCCloseButton><TimesIcon /></TOCCloseButton>
    </Header>
  );
}

function TocToggle({
  title,
}: { title: string }) {
  return (
    // TreeItemContent does not render a DOM node
    <Styled.StyledTreeItemContent>
      <Styled.SummaryWrapper>
        <Styled.ExpandIcon />
        <Styled.CollapseIcon />
        <Styled.SummaryTitle dangerouslySetInnerHTML={{ __html: title }} />
      </Styled.SummaryWrapper>
    </Styled.StyledTreeItemContent>
  );
}

function shouldBeOpen(page: Page | undefined, node: ArchiveTree) {
  return Boolean(page && archiveTreeContainsNode(node, page.id));
}

function ArchiveTreeComponent({
  item,
  book,
  page,
  activeSection,
  onNavigate,
  expandedKeys,
  handleTreeItemClick,
}: {
  item: LinkedArchiveTree;
  book: Book | undefined;
  page: Page | undefined;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  expandedKeys: Set<string>;
  handleTreeItemClick: (id: string) => void;
}) {

  if (shouldBeOpen(page, item)) {
    expandedKeys.add(item.id);
  }

  return (
    <>
      <TocToggle title={item.title} />
      <TocSection
        book={book}
        page={page}
        section={item}
        activeSection={activeSection}
        onNavigate={onNavigate}
        expandedKeys={expandedKeys}
        handleTreeItemClick={handleTreeItemClick}
      />
    </>
  );
}

export function maybeAriaLabel(page: LinkedArchiveTreeSection, active?: boolean) {
  const [num, titleText] = splitTitleParts(page.title);
  const currentPageAriaLabel = { 'aria-label': 'Current Page' };
  if (num) {
    return active ? currentPageAriaLabel : {};
  }

  const [parentNum, parentTitleText] = splitTitleParts(page.parent.title);

  if (!parentNum || titleText.includes(parentTitleText)) {
    return active ? currentPageAriaLabel : {};
  }

  const activeAriaLabel = active ? '- Current Page' : '';

  return { 'aria-label': `${titleText} - Chapter ${parentNum} ${activeAriaLabel}` };
}

function TocSection({
  book,
  page,
  section,
  activeSection,
  onNavigate,
  expandedKeys,
  handleTreeItemClick,
}: {
  book: Book | undefined;
  page: Page | undefined;
  section: ArchiveTree;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  expandedKeys: Set<string>;
  handleTreeItemClick: (id: string) => void;
}) {
  return (
    <>
      {linkContents(section).map((item) => {
        const sectionType = getArchiveTreeSectionType(item);
        const active = page && stripIdVersion(item.id) === page.id;

        return (
          <Styled.StyledTreeItem
            section={section}
            id={item.id}
            key={item.id}
            textValue={item.title}
            onClick={() => handleTreeItemClick(item.id)}
          >
            {isArchiveTree(item)
              ?
              <ArchiveTreeComponent
                item={item}
                book={book}
                page={page}
                activeSection={activeSection}
                onNavigate={onNavigate}
                expandedKeys={expandedKeys}
                handleTreeItemClick={handleTreeItemClick}
              />
              : <Styled.NavItem
                data-type={sectionType}
                ref={active ? activeSection : null}
                textValue={item.title}
              >
                <Styled.ContentLink
                  onClick={onNavigate}
                  book={book}
                  page={item}
                  dangerouslySetInnerHTML={{ __html: item.title }}
                  {...maybeAriaLabel(item, active)}
                />
              </Styled.NavItem>}
          </Styled.StyledTreeItem>
        );
      })}
    </>
  );
}

export class TableOfContents extends Component<SidebarProps, { expandedKeys: Set<string> }> {
  public sidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();

  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      expandedKeys: new Set(),
    };
    this.handleExpandedChange = this.handleExpandedChange.bind(this);
    this.handleTreeItemClick = this.handleTreeItemClick.bind(this);
  }

  public render() {
    const { isOpen, book } = this.props;

    if (isSSR()) return null;

    return (
      <SidebarBody isTocOpen={isOpen} ref={this.sidebar}>
        <TocHeader />
        {book && (
          <Styled.StyledTree
            aria-label='Table of Contents'
            expandedKeys={this.state.expandedKeys}
            onExpandedChange={this.handleExpandedChange}
          >
            <TocSection
              book={book}
              page={this.props.page}
              section={book.tree}
              activeSection={this.activeSection}
              onNavigate={this.props.onNavigate}
              expandedKeys={this.state.expandedKeys}
              handleTreeItemClick={this.handleTreeItemClick}
            />
          </Styled.StyledTree >
        )}
      </SidebarBody>
    );
  }

  handleExpandedChange(expandedKeys: Set<string>) {
    this.setState({ expandedKeys });
  }

  handleTreeItemClick = (id: string) => {
    const prev = this.state.expandedKeys;
    const next = new Set(prev);
    next.delete(id);
    this.setState({ expandedKeys: next });
  };

  public componentDidMount() {
    this.scrollToSelectedPage();
    const sidebar = this.sidebar.current;

    if (!sidebar || typeof (window) === 'undefined') {
      return;
    }

    const { callback, deregister } = setSidebarHeight(sidebar, window);
    callback();
    this.deregister = deregister;
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

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(this.sidebar.current, this.activeSection.current);
  }
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    onNavigate: () => {
      dispatch(closeMobileMenu());
      dispatch(resetToc());
    },
  })
)(TableOfContents);
