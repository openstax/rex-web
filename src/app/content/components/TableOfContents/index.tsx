import { HTMLElement, NodeListOf, Element } from '@openstax/types/lib.dom';
import React, { Component, MutableRefObject } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import { closeMobileMenu, resetToc } from '../../actions';
import { isArchiveTree } from '../../guards';
import { linkContents } from '../../search/utils';
import * as selectors from '../../selectors';
import { ArchiveTree, Book, Page, State } from '../../types';
import { archiveTreeContainsNode, getArchiveTreeSectionType } from '../../utils/archiveTreeUtils';
import { expandCurrentChapter, scrollSidebarSectionIntoView, setSidebarHeight } from '../../utils/domUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { CloseToCAndMobileMenuButton, TOCBackButton, TOCCloseButton } from '../SidebarControl';
import { Header, HeaderText, SidebarPaneBody } from '../SidebarPane';
import { LeftArrow, TimesIcon } from '../Toolbar/styled';
import * as Styled from './styled';
import { createTrapTab, useMatchMobileQuery, useMatchMobileMediumQuery } from '../../../reactUtils';

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
        'ol > li a, old > li summary'
      ) as HTMLElement;
      const el = mRef.current;
      const transitionListener = () => {
        firstItemInToc?.focus();
      };

      if (props.isTocOpen) {
        // This is primarily for code coverage
        transitionListener();
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
  defaultOpen,
  title,
  children,
}: React.PropsWithChildren<{ defaultOpen: boolean; title: string }>) {
  return (
    <Styled.NavDetails {...(defaultOpen ? {defaultOpen} : {})}>
      <Styled.Summary>
        <Styled.SummaryWrapper>
          <Styled.ExpandIcon/>
          <Styled.CollapseIcon/>
          <Styled.SummaryTitle dangerouslySetInnerHTML={{__html: title}}/>
        </Styled.SummaryWrapper>
      </Styled.Summary>
        {children}
    </Styled.NavDetails>
  );
}

function TocSection({
  book,
  page,
  section,
  activeSection,
  onNavigate,
}: {
  book: Book | undefined;
  page: Page | undefined;
  section: ArchiveTree;
  activeSection: React.RefObject<HTMLElement>;
  onNavigate: () => void;
}) {
  return (
    <Styled.NavOl section={section}>
      {linkContents(section).map((item) => {
        const sectionType = getArchiveTreeSectionType(item);
        const active = page && stripIdVersion(item.id) === page.id;

        return isArchiveTree(item)
        ? <Styled.NavItem key={item.id} sectionType={sectionType}>
            <TocNode defaultOpen={shouldBeOpen(page, item)} title={item.title}>
                <TocSection
                  book={book} page={page} section={item} activeSection={activeSection}
                  onNavigate={onNavigate}
                />
            </TocNode>
          </Styled.NavItem>
        : <Styled.NavItem
          key={item.id}
          sectionType={sectionType}
          ref={active ? activeSection : null}
          active={active}
        >
          <Styled.ContentLink
            onClick={onNavigate}
            book={book}
            page={item}
            dangerouslySetInnerHTML={{__html: item.title}}
          />
        </Styled.NavItem>;
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
          />
        )}
      </SidebarBody>
    );
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
    const sidebar = this.sidebar.current;

    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }

    const {callback, deregister} = setSidebarHeight(sidebar, window);
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
