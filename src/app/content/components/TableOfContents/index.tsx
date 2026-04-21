import { HTMLElement, HTMLButtonElement, HTMLAnchorElement } from '@openstax/types/lib.dom';
import React, { Component, MutableRefObject } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Tree, TreeItem, TreeItemContent } from 'react-aria-components';
import { AppState, Dispatch } from '../../../types';
import { closeMobileMenu, resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import { linkContents } from '../../search/utils';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, LinkedArchiveTree, LinkedArchiveTreeSection, Page, State } from '../../types';
import { getArchiveTreeSectionType, splitTitleParts, findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollSidebarSectionIntoView, setSidebarHeight } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CloseToCAndMobileMenuButton, TOCBackButton, TOCCloseButton } from '../SidebarControl';
import { Header, HeaderText, SidebarPaneBody } from '../SidebarPane';
import { LeftArrow, TimesIcon } from '../Toolbar/styled';
import { ExpandIcon, CollapseIcon } from './styled';
import ContentLink from '../ContentLink';
import getNumberWidth, { dividerWidth } from './utils';
import { createTrapTab, useMatchMobileQuery, useMatchMobileMediumQuery, isSSR } from '../../../reactUtils';
import { stripHtml } from '../../../utils';
import { iconSize } from '../../../components/Details';

import './TableOfContents.css';

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
    const listener = createTrapTab(mRef.current);
    if (isTocOpen && isMobile) {
      document?.addEventListener('keydown', listener, true);
    }

    return () => document?.removeEventListener('keydown', listener, true);
  }, [mRef, isTocOpen, isMobile, isPhone]);

  return null;
}

const SidebarBody = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof SidebarPaneBody>
>((props, ref) => {
  const mRef = ref as MutableRefObject<HTMLElement>;
  const isTocOpenRef = React.useRef(props.isTocOpen);

  // Update the ref synchronously during render to avoid timing issues
  isTocOpenRef.current = props.isTocOpen;

  React.useEffect(
    () => {
      const el = mRef.current;
      const transitionListener = () => {
        // Check the current state via ref, not the captured closure value
        if (isTocOpenRef.current) {
          // Focus first item when TOC opens
          const firstItemInToc = el?.querySelector(
            '[role="treegrid"] div'
          ) as HTMLElement;
          firstItemInToc?.focus();
        } else {
          // Restore focus to TOC button when TOC closes
          const tocButton = document?.querySelector<HTMLButtonElement>('[data-testid="toc-button"]');
          tocButton?.focus();
        }
      };

      el?.addEventListener('transitionend', transitionListener);

      return () => el?.removeEventListener('transitionend', transitionListener);
    },
    [mRef] // Only depend on mRef, not props.isTocOpen
  );

  return (
    <React.Fragment>
      {!isSSR() && (
        <TabTrapper
          mRef={mRef}
          isTocOpen={props.isTocOpen}
        />
      )}
      <SidebarPaneBody
        ref={ref}
        id='toc-sidebar'
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
    <TreeItemContent>
      <div className="toc-summary-wrapper">
        <span className="toc-expand-icon"><ExpandIcon /></span>
        <span className="toc-collapse-icon"><CollapseIcon /></span>
        <span className="toc-summary-title" dangerouslySetInnerHTML={{ __html: title }}/>
      </div>
    </TreeItemContent>
  );
}

function ArchiveTreeComponent({
  item,
  book,
  page,
  activeSection,
  onNavigate,
  expandedKeys,
}: {
  item: LinkedArchiveTree;
  book: Book;
  page: Page | undefined;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  expandedKeys: Set<string>;
}) {
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
      />
    </>
  );
}

// Helper function to get chapter disambiguation info for i18n formatting
// Returns structured data when a page title needs chapter context (unnumbered pages)
function getChapterDisambiguation(page: LinkedArchiveTreeSection): {
  titleText: string;
  chapterNumber: string;
} | null {
  const [num, titleText] = splitTitleParts(page.title);
  if (num) {
    return null;
  }

  const [parentNum, parentTitleText] = splitTitleParts(page.parent.title);

  if (!parentNum || titleText?.includes(parentTitleText)) {
    return null;
  }

  return {
    titleText,
    chapterNumber: parentNum,
  };
}

function TocLeaf({
  item,
  sectionType,
  onNavigate,
  book,
  active,
  numberWidth,
  marginLeft,
}: {
  item: LinkedArchiveTreeSection;
  sectionType: string;
  onNavigate: () => void;
  book: Book;
  active: boolean | undefined;
  numberWidth: number;
  marginLeft: number;
}) {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const intl = useIntl();
  const strippedTitle = stripHtml(item.title, true);

  // Check if chapter disambiguation is needed for unnumbered pages
  const disambiguationInfo = getChapterDisambiguation(item);
  const disambiguatedTitle = disambiguationInfo
    ? intl.formatMessage(
        { id: 'i18n:toc:aria-label:chapter-disambiguation' },
        { title: disambiguationInfo.titleText, chapterNumber: disambiguationInfo.chapterNumber }
      )
    : strippedTitle;

  // Build aria attributes for ContentLink with proper i18n
  const contentLinkAriaAttrs: { 'aria-current'?: string; 'aria-label'?: string } = {};
  if (active) {
    contentLinkAriaAttrs['aria-current'] = 'page';
  }
  // Only add aria-label to ContentLink if disambiguation is needed
  if (disambiguationInfo) {
    contentLinkAriaAttrs['aria-label'] = disambiguatedTitle;
  }

  return (
    <TreeItem
      id={item.id}
      key={item.id}
      textValue={strippedTitle}
      aria-label={intl.formatMessage({ id: 'i18n:toc:aria-label:link' }, { title: disambiguatedTitle })}
      className="toc-tree-item"
      style={{
        '--toc-number-width': `${numberWidth}rem`,
        '--toc-divider-width': `${dividerWidth}rem`,
        '--toc-margin-left': `${marginLeft}rem`,
        '--details-icon-size': `${iconSize}rem`,
      } as React.CSSProperties}
      onAction={
        // Ignored until RAC and TS versions are compatible
        // istanbul ignore next
        () => {
          linkRef.current?.click();
        }
      }
    >
      <TreeItemContent
        className="toc-nav-item"
        data-type={sectionType}
        textValue={strippedTitle}
      >
        <ContentLink
          ref={linkRef}
          onClick={onNavigate}
          book={book}
          page={item}
          className="toc-content-link"
          dangerouslySetInnerHTML={{ __html: item.title }}
          style={{'--details-icon-size': `${iconSize}rem`}}
          {...contentLinkAriaAttrs}
        />
      </TreeItemContent>
    </TreeItem>
  );
}

function TocSection({
  book,
  page,
  section,
  activeSection,
  onNavigate,
  expandedKeys,
}: {
  book: Book;
  page: Page | undefined;
  section: ArchiveTree;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  expandedKeys: Set<string>;
}) {
  const intl = useIntl();
  // Compute dynamic styles
  const numberWidth = getNumberWidth(section.contents);
  const marginLeft = numberWidth + dividerWidth;

  return (
    <>
      {linkContents(section).map((item) => {
        const sectionType = getArchiveTreeSectionType(item);
        const active = page && stripIdVersion(item.id) === page.id;
        const strippedTitle = stripHtml(item.title, true);

        return (
          <React.Fragment key={item.id}>
            {isArchiveTree(item)
              ?
              <TreeItem
                id={item.id}
                textValue={strippedTitle}
                aria-label={intl.formatMessage({ id: 'i18n:toc:aria-label:section' }, { title: strippedTitle })}
                className="toc-tree-item"
                style={{
                  '--toc-number-width': `${numberWidth}rem`,
                  '--toc-divider-width': `${dividerWidth}rem`,
                  '--toc-margin-left': `${marginLeft}rem`,
                } as React.CSSProperties}
              >
                <ArchiveTreeComponent
                  item={item}
                  book={book}
                  page={page}
                  activeSection={activeSection}
                  onNavigate={onNavigate}
                  expandedKeys={expandedKeys}
                />
              </TreeItem>
              : <TocLeaf
                item={item}
                sectionType={sectionType}
                onNavigate={onNavigate}
                book={book}
                active={active}
                numberWidth={numberWidth}
                marginLeft={marginLeft}
              />}
          </React.Fragment>
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
    this.handleTreeKeyUp = this.handleTreeKeyUp.bind(this);
  }

  public render() {
    const { isOpen, book } = this.props;

    if (isSSR()) return null;

    return (
      <SidebarBody isTocOpen={isOpen} ref={this.sidebar}>
        <TocHeader />
        {book && (
          <div>
            <Tree
              aria-label='Table of Contents'
              expandedKeys={this.state.expandedKeys}
              onExpandedChange={this.handleExpandedChange}
              onKeyUp={this.handleTreeKeyUp}
            >
              <TocSection
                book={book}
                page={this.props.page}
                section={book.tree}
                activeSection={this.activeSection}
                onNavigate={this.props.onNavigate}
                expandedKeys={this.state.expandedKeys}
              />
            </Tree >
          </div>
        )}
      </SidebarBody>
    );
  }

  handleExpandedChange(expandedKeys: Set<string>) {
    this.setState({ expandedKeys });
  }

  public componentDidUpdate(prevProps: SidebarProps) {
    if (this.props.page !== prevProps.page) {
      expandCurrentChapter(this.activeSection.current);
      this.scrollToSelectedPage();
      // Auto-expand parent chapters when page changes
      this.expandParentsOfCurrentPage();
    }
  }

  private expandParentsOfCurrentPage() {
    const { page, book } = this.props;
    if (!page || !book) return;

    // Find the current page node in the tree using its ID
    const currentNode = findArchiveTreeNodeById(book.tree, page.id);
    if (!currentNode) return;

    const newExpandedKeys = new Set(this.state.expandedKeys);
    let changed = false;

    // Walk up the parent chain and collect all ancestor IDs
    // Stop before adding book.tree (root) since it's not rendered as a TreeItem
    let parent: LinkedArchiveTree | undefined = (currentNode as LinkedArchiveTreeSection).parent;
    while (parent && parent.id !== book.tree.id) {
      if (!newExpandedKeys.has(parent.id)) {
        newExpandedKeys.add(parent.id);
        changed = true;
      }
      parent = parent.parent;
    }

    if (changed) {
      this.setState({ expandedKeys: newExpandedKeys });
    }
  }

  handleTreeKeyUp = (event: React.KeyboardEvent) => {
    // Handle Shift+Tab to move focus to the close button
    if (event.key === 'Tab' && event.shiftKey) {
      // Find the close button in the TOC header
      const closeButton = this.sidebar.current?.querySelector('[data-testid="tocheader"] button[data-testid="toc-button"]') as HTMLElement;
      if (closeButton) {
        closeButton.focus();
        event.preventDefault();
      }
    }
  };

  public componentDidMount() {
    this.scrollToSelectedPage();

    // Expand parents of current page on initial load
    this.expandParentsOfCurrentPage();
    const sidebar = this.sidebar.current;

    if (!sidebar || typeof (window) === 'undefined') {
      return;
    }

    const { callback, deregister } = setSidebarHeight(sidebar, window);
    callback();
    this.deregister = deregister;
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
