import { HTMLAnchorElement, HTMLDivElement, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../../helpers/mathjax';
import Loader from '../../../components/Loader';
import MainContent from '../../../components/MainContent';
import { assertWindow } from '../../../utils';
import { preloadedPageIdIs } from '../../utils';
import getCleanContent from '../../utils/getCleanContent';
import { PagePropTypes } from './connector';
import { mapSolutions, toggleSolution, transformContent } from './contentDOMTransformations';
import * as contentLinks from './contentLinkHandler';
import highlightManager, { stubHighlightManager } from './highlightManager';
import scrollTargetManager, { stubScrollTargetManager } from './scrollTargetManager';
import searchHighlightManager, { stubManager } from './searchHighlightManager';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "NodeList.forEach" */ 'mdn-polyfills/NodeList.prototype.forEach');
}

export default class PageComponent extends Component<PagePropTypes> {
  public container = React.createRef<HTMLDivElement>();
  private clickListeners = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  private searchHighlightManager = stubManager;
  private highlightManager = stubHighlightManager;
  private scrollTargetManager = stubScrollTargetManager;
  private processing: Promise<void> = Promise.resolve();

  public getCleanContent = () => {
    const {book, page, services} = this.props;
    return getCleanContent(book, page, services.archiveLoader, contentLinks.reduceReferences(this.props.contentLinks));
  };

  public componentDidMount() {
    this.postProcess();
    if (!this.container.current) {
      return;
    }
    this.searchHighlightManager = searchHighlightManager(this.container.current);
    this.highlightManager = highlightManager(this.container.current, () => this.props.highlights);
    this.scrollTargetManager = scrollTargetManager(this.container.current);
  }

  public async componentDidUpdate(prevProps: PagePropTypes) {
    // if there is a previous processing job, wait for it to finish.
    // this is mostly only relevant for initial load to ensure search results
    // are not highlighted before math is done typesetting, but may also
    // be relevant if there are rapid page navigations.
    await this.processing;

    this.scrollTargetManager(prevProps.scrollTarget, this.props.scrollTarget);

    if (prevProps.page !== this.props.page) {
      await this.postProcess();
    }

    this.highlightManager.update();
    this.searchHighlightManager.update(prevProps.searchHighlights, this.props.searchHighlights);
  }

  public getSnapshotBeforeUpdate(prevProps: PagePropTypes) {
    if (prevProps.page !== this.props.page) {
      this.listenersOff();
    }
    return null;
  }

  public componentWillUnmount() {
    this.listenersOff();
    this.searchHighlightManager.unmount();
    this.highlightManager.unmount();
  }

  public render() {
    if (!this.props.page) {
      return this.renderLoading();
    }

    const html = this.getCleanContent() || this.getPrerenderedContent();

    return <MainContent
      className={this.props.className}
      ref={this.container}
      dangerouslySetInnerHTML={{ __html: html}}
    />;
   }

  private renderLoading = () => <MainContent className={this.props.className} ref={this.container}>
    <Loader large delay={1500} />
  </MainContent>;

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

    this.mapLinks((a) => {
      const handler = contentLinks.contentLinkHandler(a, () => this.props.contentLinks);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });

    mapSolutions(this.container.current, (button) => {
      const handler = toggleSolution(button, this.props.intl);
      this.clickListeners.set(button, handler);
      button.addEventListener('click', handler);
    });
  }

  private listenersOff() {
    const removeIfExists = (el: HTMLElement) => {
      const handler = this.clickListeners.get(el);
      if (handler) {
        el.removeEventListener('click', handler);
      }
    };

    this.mapLinks(removeIfExists);
    mapSolutions(this.container.current, removeIfExists);
  }

  private postProcess() {
    const container = this.container.current;

    if (!container) {
      return;
    }

    transformContent(container, this.props.intl);
    this.listenersOn();

    const promise = typesetMath(container, assertWindow());
    this.props.services.promiseCollector.add(promise);
    this.processing = promise;

    return promise;
  }
}
