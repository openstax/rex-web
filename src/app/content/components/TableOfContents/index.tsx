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
import { createTrapTab, useMatchMobileQuery, useMatchMobileMediumQuery } from '../../../reactUtils';
import { useKeyboardSupport, KeyboardSupportProps } from './keyboardSupport.hook';

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
        'ol > li a'
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

function TocNode({
  id,
  isOpen,
  title,
  onClick,
  onKeyDown,
}: React.PropsWithChildren<{
  id: string;
  title: string,
  isOpen: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void,
}>) {

  return (
    <Styled.NavDetails id={id} onClick={onClick} onKeyDown={onKeyDown} open={isOpen} aria-expanded={isOpen} tabIndex={0}>
      <Styled.CollapseIcon />
      <Styled.ExpandIcon />
      <Styled.SummaryTitle dangerouslySetInnerHTML={{ __html: title }} />
    </Styled.NavDetails>
  );
}


function maybeAriaLabel(page: LinkedArchiveTreeSection) {
  const [num, titleText] = splitTitleParts(page.title);

  if (num) {
    return {};
  }

  const [parentNum, parentTitleText] = splitTitleParts(page.parent.title);

  if (!parentNum || titleText.includes(parentTitleText)) {
    return {};
  }

  return { 'aria-label': `${titleText} - Chapter ${parentNum}` };
}

function ArchiveTreeComponent({
  item,
  book,
  page,
  activeSection,
  onNavigate,
  onKeyDown,
}: {
  item: LinkedArchiveTree;
  book: Book | undefined;
  page: Page | undefined;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  onKeyDown: (props: KeyboardSupportProps) => void;
}) {
  const sectionType = getArchiveTreeSectionType(item);

  const [isOpen, setOpen] = React.useState<boolean>(shouldBeOpen(page, item));

  const toggleOpen = () => {
    setOpen((prevState) => !prevState);
  };

  const onKeyDownSupport = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    onKeyDown({
      event: e,
      item,
      isOpen,
      onSelect: toggleOpen
    });
  }

  return (
    <Styled.NavItem key={item.id} sectionType={sectionType}>
      <TocNode
        id={item.id}
        aria-owns={item.id + '-subtree'}
        title={item.title}
        isOpen={isOpen}
        onClick={toggleOpen}
        onKeyDown={onKeyDownSupport}
      />
      <TocSection
        id={item.id + '-subtree'}
        book={book}
        page={page}
        section={item}
        activeSection={activeSection}
        onNavigate={onNavigate}
        open={isOpen}
      />
    </Styled.NavItem>
  );
}

function TocSection({
  id,
  book,
  page,
  section,
  activeSection,
  onNavigate,
  open,
}: {
  id?: string;
  book: Book | undefined;
  page: Page | undefined;
  section: ArchiveTree;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
  open: boolean;
}) {

  const linkedContents = linkContents(section);
  const { onKeyDownNavItemSupport, onKeyDownNavGroupSupport } = useKeyboardSupport();

  return (
    <Styled.NavOl 
      id={id} 
      role={book?.id === stripIdVersion(section.id) ? 'tree' : 'group' } 
      section={section} 
      open={open}
    >
      {linkedContents.map((item) => {
        const sectionType = getArchiveTreeSectionType(item);
        const active = page && stripIdVersion(item.id) === page.id;

        return isArchiveTree(item) ? (
          <ArchiveTreeComponent
            key={item.id}
            item={item}
            book={book}
            page={page}
            activeSection={activeSection}
            onNavigate={onNavigate}
            onKeyDown={onKeyDownNavGroupSupport}
          />
        ) : (
          <Styled.NavItem
            key={item.id}
            sectionType={sectionType}
            ref={active ? activeSection : null}
            active={active}
          >
            <Styled.ContentLink
              id={item.id}
              onClick={onNavigate}
              onKeyDown={
                (e: React.KeyboardEvent<HTMLAnchorElement>, onSelect: ()=> void) => 
                  onKeyDownNavItemSupport({
                    event: e, 
                    item, 
                    onSelect,
                  })
              }
              book={book}
              page={item}
              dangerouslySetInnerHTML={{ __html: item.title }}
              {...maybeAriaLabel(item)}
              role='treeitem'
            />
          </Styled.NavItem>
        );
      })}
    </Styled.NavOl>
  );
}

function shouldBeOpen(page: Page | undefined, node: ArchiveTree) {
  return Boolean(page && archiveTreeContainsNode(node, page.id));
}

export class TableOfContents extends Component<SidebarProps> {
  public sidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();

  public render() {
    const { isOpen, book } = this.props;

    return (
      <SidebarBody isTocOpen={isOpen} ref={this.sidebar}>
        <TocHeader />
        {book && (
          <TocSection
            book={book}
            page={this.props.page}
            section={book.tree}
            activeSection={this.activeSection}
            onNavigate={this.props.onNavigate}
            open
          />
        )}
      </SidebarBody>
    );
  }

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
