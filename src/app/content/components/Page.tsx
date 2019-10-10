import { HTMLAnchorElement, HTMLDivElement, HTMLElement, MouseEvent } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../helpers/mathjax';
import Loader from '../../components/Loader';
import MainContent from '../../components/MainContent';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { MAIN_CONTENT_ID } from '../../context/constants';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { AppServices, AppState } from '../../types';
import { Dispatch } from '../../types';
import { assertWindow, resetTabIndex, scrollTo } from '../../utils';
import { content } from '../routes';
import * as select from '../selectors';
import { State } from '../types';
import getCleanContent from '../utils/getCleanContent';
import { getBookPageUrlAndParams, toRelativeUrl } from '../utils/urlUtils';
import { contentTextWidth } from './constants';
import allImagesLoaded from './utils/allImagesLoaded';
import { mapSolutions, toggleSolution, transformContent } from './utils/contentDOMTransformations';
import searchHighlightManager, { mapStateToSearchHighlightProp, stubManager } from './utils/searchHighlightManager';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "NodeList.forEach" */ 'mdn-polyfills/NodeList.prototype.forEach');
}

interface PropTypes {
  intl: IntlShape;
  page: State['page'];
  book: State['book'];
  hash: string;
  currentPath: string;
  navigate: typeof push;
  className?: string;
  locationState: ReturnType<typeof selectNavigation.locationState>;
  searchHighlights: ReturnType<typeof mapStateToSearchHighlightProp>;
  references: State['references'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container = React.createRef<HTMLDivElement>();
  private clickListeners = new WeakMap<HTMLElement, (e: MouseEvent) => void>();
  private searchHighlightManager = stubManager;
  private processing: Promise<void> = Promise.resolve();

  public getCleanContent = () => {
    const {book, page, services, currentPath} = this.props;
    return getCleanContent(book, page, services.archiveLoader, (pageContent) =>
      this.props.references.reduce((html, reference) =>
        html.replace(reference.match, toRelativeUrl(currentPath, content.getUrl(reference.params))), pageContent));
  };

  public scrollToTop() {
    const window = assertWindow();
    resetTabIndex(window.document);
    window.scrollTo(0, 0);
  }

  public componentDidMount() {
    if (!this.container.current) {
      return;
    }
    this.searchHighlightManager = searchHighlightManager(this.container.current);
    this.postProcess();
  }

  public async componentDidUpdate(prevProps: PropTypes) {
    // if there is a previous processing job, wait for it to finish.
    // this is mostly only relevant for initial load to ensure search results
    // are not highlighted before math is done typesetting, but may also
    // be relevant if there are rapid page navigations.
    await this.processing;

    if (prevProps.page !== this.props.page) {
      this.scrollToTargetOrTop();
      await this.postProcess();
    } else if (prevProps.hash !== this.props.hash) {
      this.scrollToTarget();
    }

    this.searchHighlightManager(prevProps.searchHighlights, this.props.searchHighlights);
  }

  public getSnapshotBeforeUpdate(prevProps: PropTypes) {
    if (prevProps.page !== this.props.page) {
      this.listenersOff();
    }
    return null;
  }

  public componentWillUnmount() {
    this.listenersOff();
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

  private scrollToTarget = () => {
    const target = this.getScrollTarget();

    if (target && this.container.current) {
      allImagesLoaded(this.container.current).then(
        () => scrollTo(target)
      );
    }
  };

  private scrollToTargetOrTop = () => {
    if (this.getScrollTarget()) {
      this.scrollToTarget();
    } else {
      this.scrollToTop();
    }
  };

  private renderLoading = () => <MainContent
    className={this.props.className}
    ref={this.container}
  >
    <Loader large delay={1500} />
  </MainContent>;

  private getPrerenderedContent() {
    if (
      typeof(window) !== 'undefined'
      && this.props.page
      && window.__PRELOADED_STATE__
      && window.__PRELOADED_STATE__.content
      && window.__PRELOADED_STATE__.content.page
      && window.__PRELOADED_STATE__.content.page.id === this.props.page.id
    ) {
      return this.props.services.prerenderedContent || '';
    }
    return '';
  }

  private getScrollTarget(): Element | null {
    return this.container.current && typeof(window) !== 'undefined' && this.props.hash
      ? this.container.current.querySelector(`[id="${this.props.hash.replace(/^#/, '')}"]`)
      : null;
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container.current) {
      Array.from(this.container.current.querySelectorAll('a')).forEach(cb);
    }
  }

  private listenersOn() {
    this.listenersOff();

    this.mapLinks((a) => {
      const handler = this.clickListener(a);
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

  private clickListener = (anchor: HTMLAnchorElement) => (e: MouseEvent) => {
    const {references, navigate, book, page, locationState} = this.props;
    const href = anchor.getAttribute('href');

    if (!href || !book || !page) {
      return;
    }

    const {hash, search, pathname} = new URL(href, assertWindow().location.href);
    const reference = references.find((ref) => content.getUrl(ref.params) === pathname);

    if (reference && reference.params.book === book.slug && !e.metaKey) {
      e.preventDefault();
      navigate({
        params: reference.params,
        route: content,
        state: {
          ...locationState,
          ...reference.state,
        },
      }, {hash, search});
    } else if (pathname === this.props.currentPath && hash && !e.metaKey) {
      e.preventDefault();
      navigate({
        params: getBookPageUrlAndParams(book, page).params,
        route: content,
        state: {
          ...locationState,
          ...getBookPageUrlAndParams(book, page).state,

        },
      }, {hash, search});
    }
  };

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

export const contentTextStyle = css`
  ${bodyCopyRegularStyle}

  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;

// tslint:disable-next-line:variable-name
const StyledPageComponent = styled(PageComponent)`
  ${contentTextStyle}

  @media screen { /* full page width in print */
    flex: 1;
    display: flex;
    width: 100%;

    > #${MAIN_CONTENT_ID} {
      width: 100%;
    }

    /* trying to add margin to a page wrapper that
     * will collapse with the margin of the top element in the
     * page. can't add it to the page element because it is flexy,
     * or the main_content because page makes it flexy. those
     * need to be flexy to center the loading indicator
     */
    > #${MAIN_CONTENT_ID} > [data-type="page"],
    > #${MAIN_CONTENT_ID} > [data-type="composite-page"] {
      margin-top: ${theme.padding.page.desktop}rem;
      ${theme.breakpoints.mobile(css`
        margin-top: ${theme.padding.page.mobile}rem;
      `)}
    }
  }

  overflow: visible; /* allow some elements, like images, videos, to overflow and be larger than the text. */

  @media screen {
    .search-highlight {
      font-weight: bold;
      background-color: #ffd17e;

      &.focus {
        background-color: #ff9e4b;

        .search-highlight {
          background-color: unset;
        }
      }
    }
  }

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;

const connector = connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    hash: selectNavigation.hash(state),
    locationState: selectNavigation.locationState(state),
    page: select.page(state),
    references: select.contentReferences(state),
    searchHighlights: mapStateToSearchHighlightProp(state),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
);

export default flow(
  injectIntl,
  withServices,
  connector
)(StyledPageComponent);
