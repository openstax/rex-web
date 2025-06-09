import { HTMLAnchorElement, HTMLDivElement, HTMLElement, MouseEvent, KeyboardEvent } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import WeakMap from 'weak-map';
import { APP_ENV } from '../../../../config';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { assertWindow } from '../../../utils';
import { preloadedPageIdIs } from '../../utils';
import getCleanContent from '../../utils/getCleanContent';
import PageToasts from '../Page/PageToasts';
import { PagePropTypes } from './connector';
import { transformContent, linksToOtherPagesOpenInNewTab } from './contentDOMTransformations';
import * as contentLinks from './contentLinkHandler';
import highlightManager, { stubHighlightManager, UpdateOptions as HighlightUpdateOptions } from './highlightManager';
import * as lazyResources from './lazyResourceManager';
import MinPageHeight from './MinPageHeight';
import PageContent from './PageContent';
import PageNotFound from './PageNotFound';
import RedoPadding from './RedoPadding';
import scrollToTopOrHashManager, { stubScrollToTopOrHashManager } from './scrollToTopOrHashManager';
import searchHighlightManager, { stubManager, UpdateOptions as SearchUpdateOptions } from './searchHighlightManager';
import { validateDOMContent } from './validateDOMContent';
import isEqual from 'lodash/fp/isEqual';
import { mediaModalManager, MediaModalPortal } from './MediaModalManager';
if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "NodeList.forEach" */ 'mdn-polyfills/NodeList.prototype.forEach');
}

const parser = new DOMParser();

export default class PageComponent extends Component<PagePropTypes> {
  public container = React.createRef<HTMLDivElement>();
  private clickListeners = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  private searchHighlightManager = stubManager;
  private highlightManager = stubHighlightManager;
  private scrollToTopOrHashManager = stubScrollToTopOrHashManager;
  private processing: Array<Promise<void>> = [];
  private componentDidUpdateCounter = 0;

  public getTransformedContent = () => {
    const {book, page, services} = this.props;

    return getCleanContent(book, page, services.archiveLoader, (content) => {
      const parsedContent = parser.parseFromString(content, 'text/html');

      contentLinks.reduceReferences(parsedContent, this.props.contentLinks);
      lazyResources.makeResourcesLazy(parsedContent);

      transformContent(parsedContent, parsedContent.body, this.props, services);

      if (this.props.lockNavigation) {
        linksToOtherPagesOpenInNewTab(parsedContent.body, this.props.currentPath);
      }

      /* this will be removed when all the books are in good order */
      /* istanbul ignore else */
      if (APP_ENV !== 'production') {
        validateDOMContent(parsedContent, parsedContent.body);
      }

      return parsedContent.body.innerHTML;
    });
  };

  public componentDidMount() {
    this.postProcess();
    if (!this.container.current) {
      return;
    }
    this.searchHighlightManager = searchHighlightManager(this.container.current, this.props.intl);
    // tslint:disable-next-line: max-line-length
    this.highlightManager = highlightManager(this.container.current, () => this.props.highlights, this.props.services, this.props.intl);
    this.scrollToTopOrHashManager = scrollToTopOrHashManager(this.container.current);
    // use manager pattern for image preview. Use react portal to move modal into page body. 
    // accept only media image because media has videos and animations. 
    // Sometimes data is already populated on mount, eg when navigating to a new tab
    // tab index and add role for button for accessability
    if (this.props.searchHighlights.selectedResult) {
      this.searchHighlightManager.update(null, this.props.searchHighlights, {
        forceRedraw: true,
        onSelect: this.onSearchHighlightSelect,
      });
    }
    this.scrollToTopOrHashManager(null, this.props.scrollToTopOrHash);
  }

  public async componentDidUpdate(prevProps: PagePropTypes) {
    // Store the id of this update. We need it because we want to update highlight managers only once
    // per rerender. componentDidUpdate is called multiple times when user navigates quickly.
    const runId = this.getRunId();

    // If page has changed, call postProcess that will remove old and attach new listeners
    // and start mathjax typesetting.
    if (prevProps.page !== this.props.page) {
      this.postProcess();
      this.container.current?.focus();
    }

    // Wait for the mathjax promise set by postProcess from previous or current componentDidUpdate call.
    await Promise.all(this.processing);

    this.scrollToTopOrHashManager(prevProps.scrollToTopOrHash, this.props.scrollToTopOrHash);

    const searchHighlightsChanged = !isEqual(
      prevProps.searchHighlights.searchResults,
      this.props.searchHighlights.searchResults
    );

    // If user navigated quickly between pages then most likely there were multiple componentDidUpdate calls started.
    // We want to update highlight manager only for the last componentDidUpdate.
    if (
      !this.shouldUpdateHighlightManagers(prevProps, this.props, runId) &&
      !searchHighlightsChanged
    ) {
      return;
    }

    const highlightsAddedOrRemoved = this.highlightManager.update(prevProps.highlights, {
      onSelect: this.onHighlightSelect,
    });

    this.searchHighlightManager.update(prevProps.searchHighlights, this.props.searchHighlights, {
      forceRedraw: highlightsAddedOrRemoved,
      onSelect: this.onSearchHighlightSelect,
    });
  }

  public onHighlightSelect: HighlightUpdateOptions['onSelect'] = (selectedHighlight) => {
    if (!selectedHighlight) {
      this.props.addToast(toastMessageKeys.highlights.failure.search, {destination: 'page'});
    }
  };

  public onSearchHighlightSelect: SearchUpdateOptions['onSelect'] = (selectedHighlight) => {
    if (!selectedHighlight) {
      this.props.addToast(toastMessageKeys.search.failure.nodeNotFound, {destination: 'page'});
    }
  };

  public componentWillUnmount() {
    this.listenersOff();
    this.searchHighlightManager.unmount();
    this.highlightManager.unmount();
  }

  public render() {
    const pageIsReady = this.props.page && this.props.textSize !== null;
    const PT = this.props.ToastOverride ? this.props.ToastOverride : PageToasts;
  
    return <MinPageHeight>
      <this.highlightManager.CardList />
      <PT />
      <MediaModalPortal />
      <RedoPadding>
        {this.props.pageNotFound
          ? this.renderPageNotFound()
          : pageIsReady
            ? this.renderContent()
            : this.renderLoading()}
      </RedoPadding>
    </MinPageHeight>;
  }

  private renderContent = () => {
    const html = this.getTransformedContent() || this.getPrerenderedContent();

    return <React.Fragment>
      <PageContent
        key='main-content'
        book={this.props.book}
        className='page-content'
        ref={this.container}
        dangerouslySetInnerHTML={{ __html: html}}
        textSize={this.props.textSize}
      />
      {this.props.children}
    </React.Fragment>;
  };

  private renderLoading = () => <PageContent
    key='main-content'
    ref={this.container}
  >
    <Loader large delay={1500} />
  </PageContent>;

  private renderPageNotFound = () => <PageContent
    key='main-content'
    ref={this.container}
  >
    <PageNotFound />
  </PageContent>;

  private getPrerenderedContent() {
    if (
      typeof(window) !== 'undefined'
      && this.props.page
      && preloadedPageIdIs(window, this.props.page.id)
    ) {
      return this.props.services.prerenderedContent || '';
    }
    return '';
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container.current) {
      Array.from(this.container.current.querySelectorAll('a')).forEach(cb);
    }
  }

  private listenersOn() {
    this.listenersOff();
    const container = this.container.current;
    if (!container) return;

    const triggerMediaModal = (target: HTMLElement) => {
      if (typeof window !== 'undefined' && window.matchMedia(`(max-width: 1200px)`).matches) {
        const outerHTML = target.outerHTML;
        mediaModalManager.open(
          <div dangerouslySetInnerHTML={{ __html: outerHTML }} />
        );
      }
    };

    const handleInteraction = (e: MouseEvent | KeyboardEvent) => {
      const target = e.target as HTMLElement;
    
      if (target.tagName !== 'IMG' || !target.hasAttribute('tabindex')) return;
    
      if (e.type === 'keydown') {
        const keyEvent = e as KeyboardEvent;
    
        if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return;
    
        keyEvent.preventDefault();
      }

      triggerMediaModal(target);
    };

    container.addEventListener('click', handleInteraction);
    container.addEventListener('keydown', handleInteraction);
    this.clickListeners.set(container, handleInteraction);

    this.mapLinks((a) => {
      const handler = contentLinks.contentLinkHandler(a, () => this.props.contentLinks, this.props.services);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });
  }

  private listenersOff() {
    const removeIfExists = (el: HTMLElement) => {
      const handler = this.clickListeners.get(el);
      if (handler) {
        el.removeEventListener('click', handler);
      }
    };
    const container = this.container.current;
    if (container) {
      const handler = this.clickListeners.get(container);
      if (handler) container.removeEventListener('click', handler);
    }
    this.mapLinks(removeIfExists);
  }
  
  private postProcess() {
    const container = this.container.current;

    if (!container) {
      return;
    }

    this.listenersOn();

    const promise = typesetMath(container, assertWindow());
    this.props.services.promiseCollector.add(promise);
    this.processing.push(promise);

    return promise.then(() => {
      this.processing = this.processing.filter((p) => p !== promise);
    });
  }

  private getRunId(): number {
    const newId = this.componentDidUpdateCounter + 1;
    this.componentDidUpdateCounter = newId;
    return newId;
  }

  /**
   * When a user navigates quickly between pages there are multiple calls to componentDidUpdate
   * and since it is an async function there might be still unresolved promisses that would result
   * in calling highlighter.update multiple times after they are done.
   * see: https://github.com/openstax/unified/issues/1169
   */
  private shouldUpdateHighlightManagers(prevProps: PagePropTypes, props: PagePropTypes, runId: number): boolean {
    // Update search highlight manager if selected result has changed.
    // If we don't do this then for the last componenDidUpdate call prevProps will equal props and it will noop.
    if (!prevProps.searchHighlights.selectedResult && props.searchHighlights.selectedResult) { return true; }
    // Update highlighters only for the latest run
    return this.componentDidUpdateCounter === runId;
  }
}
