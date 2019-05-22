import { Element, Event, HTMLAnchorElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import styled, { css } from 'styled-components/macro';
import url from 'url';
import WeakMap from 'weak-map';
import { typesetMath } from '../../../helpers/mathjax';
import MainContent from '../../components/MainContent';
import { bodyCopyRegularStyle } from '../../components/Typography';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { AppServices, AppState } from '../../types';
import { assertDefined } from '../../utils';
import { content } from '../routes';
import * as select from '../selectors';
import { State } from '../types';
import { contentTextWidth } from './constants';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  hash: string;
  navigate: typeof push;
  className?: string;
  references: State['references'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container: Element | undefined | null = null;
  private clickListeners = new WeakMap<HTMLAnchorElement, (e: Event) => void>();

  public getCleanContent = () => {
    const {book, page, services} = this.props;

    const cachedPage = book && page &&
      services.archiveLoader.book(book.id, book.version).page(page.id).cached()
    ;

    const pageContent = cachedPage ? cachedPage.content : '';

    return this.props.references.reduce((html, reference) =>
      html.replace(reference.match, content.getUrl(reference.params))
    , pageContent)
      // remove body and surrounding content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      // fix assorted self closing tags
      .replace(/<(em|h3|iframe|span|strong|sub|sup|u)([^>]*?)\/>/g, '<$1$2></$1>')
      // remove page titles from content (they are in the nav)
      .replace(/<h(1|2) data-type="document-title".*?<\/h(1|2)>/, '')
    ;
  };

  public componentDidMount() {
    const target = this.getScrollTarget();
    this.postProcess();
    this.linksOn();
    if (this.container) { this.addGenericJs(this.container); }
    if (target) {
      scrollTo(target);
    }
  }

  public componentDidUpdate(prevProps: PropTypes) {
    const target = this.getScrollTarget();
    this.postProcess();

    if (this.container && typeof(window) !== 'undefined' && prevProps.page !== this.props.page) {
      this.linksOn();

      this.addGenericJs(this.container);
      if (target) {
        scrollTo(target);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }

  public getSnapshotBeforeUpdate() {
    this.linksOff();
    return null;
  }

  public componentWillUnmount() {
    if (this.container) {
      this.linksOff();
    }
  }

  public render() {
    return <MainContent
      className={this.props.className}
      ref={(ref: any) => this.container = ref}
      dangerouslySetInnerHTML={{ __html: this.getCleanContent()}}
    />;
  }

  // from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
  // .../src/scripts/modules/media/body/body.coffee#L123
  private addGenericJs(rootEl: Element) {
    this.addScopeToTables(rootEl);
    this.wrapElements(rootEl);
    this.tweakFigures(rootEl);
    this.addNoFollow(rootEl);
    this.fixLists(rootEl);
  }

  private addScopeToTables(rootEl: Element) {
    rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
  }

  // Wrap title and content elements in header and section elements, respectively
  private wrapElements(rootEl: Element) {
    rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
      [data-type="example"], [data-type="exercise"],
      [data-type="note"], [data-type="abstract"]`).forEach((el) => {

      // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
      const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

      const bodyWrap = assertDefined(document, 'document should be defined').createElement('section');
      bodyWrap.append(...Array.from(el.childNodes));

      const titleWrap = assertDefined(document, 'document should be defined').createElement('header');
      titleWrap.append(...Array.from(titles));

      el.append(titleWrap, bodyWrap);

      // Add an attribute for the parents' `data-label`
      // since CSS does not support `parent(attr(data-label))`.
      // When the title exists, this attribute is added before it
      const label = el.getAttribute('data-label');
      if (label) {
        titles.forEach((title) => title.setAttribute('data-label-parent', label));
      }

      // Add a class for styling since CSS does not support `:has(> .title)`
      // NOTE: `.toggleClass()` explicitly requires a `false` (not falsy) 2nd argument
      if (titles.length > 0) {
        el.classList.add('ui-has-child-title');
      }
    });
  }

  private tweakFigures(rootEl: Element) {
    // move caption to bottom of figure
    rootEl.querySelectorAll('figure > figcaption').forEach((el) => {
      const parent = assertDefined(el.parentElement, 'figcaption parent should always be defined');
      parent.classList.add('ui-has-child-figcaption');
      parent.appendChild(el);
    });
  }

  // Add nofollow to external user-generated links
  private addNoFollow(rootEl: Element) {
    rootEl.querySelectorAll('a[href^="http:"], a[href^="https:"], a[href^="//"]')
    .forEach((el) => el.setAttribute('rel', 'nofollow'));
  }

  private fixLists(rootEl: Element) {
    // Copy data-mark-prefix and -suffix from ol to li so they can be used in css
    rootEl.querySelectorAll(`ol[data-mark-prefix] > li, ol[data-mark-suffix] > li,
    [data-type="list"][data-list-type="enumerated"][data-mark-prefix] > [data-type="item"],
    [data-type="list"][data-list-type="enumerated"][data-mark-suffix] > [data-type="item"]`).forEach((el) => {
      const parent = assertDefined(el.parentElement, 'list parent should always be defined');
      const markPrefix = parent.getAttribute('data-mark-prefix');
      const markSuffix = parent.getAttribute('data-mark-suffix');
      if (markPrefix) { el.setAttribute('data-mark-prefix', markPrefix); }
      if (markSuffix) { el.setAttribute('data-mark-suffix', markSuffix); }
    });
    rootEl.querySelectorAll('ol[start], [data-type="list"][data-list-type="enumerated"][start]').forEach((el) => {
      el.setAttribute('style', `counter-reset: list-item ${el.getAttribute('start')}`);
    });
}

  private getScrollTarget(): Element | null {
    return this.container && typeof(window) !== 'undefined' && this.props.hash
      ? this.container.querySelector(`[id="${this.props.hash.replace(/^#/, '')}"]`)
      : null;
  }

  private mapLinks(cb: (a: HTMLAnchorElement) => void) {
    if (this.container) {
      Array.from(this.container.querySelectorAll('a')).forEach(cb);
    }
  }

  private linksOn() {
    this.mapLinks((a) => {
      const handler = this.clickListener(a);
      this.clickListeners.set(a, handler);
      a.addEventListener('click', handler);
    });
  }

  private linksOff() {
    this.mapLinks((a) => {
      const handler = this.clickListeners.get(a);
      if (handler) {
        a.removeEventListener('click', handler);
      }
    });
  }

  private clickListener = (anchor: HTMLAnchorElement) => (e: Event) => {
    const {references, navigate} = this.props;
    const href = anchor.getAttribute('href');

    if (!href) {
      return;
    }

    const parsed = url.parse(href);
    const hash = parsed.hash || '';
    const search = parsed.search || '';
    const path = href.replace(hash, '').replace(search, '');
    const reference = references.find((ref) => content.getUrl(ref.params) === path);

    if (reference) {
      e.preventDefault();
      navigate({
        params: reference.params,
        route: content,
        state: reference.state,
      }, {hash, search});
    }
  };

  private postProcess() {
    if (this.container && typeof(window) !== 'undefined') {
      const promise = typesetMath(this.container, window);
      this.props.services.promiseCollector.add(promise);
    }
  }
}

export const contentTextStyle = css`
  ${bodyCopyRegularStyle}
  max-width: ${contentTextWidth}rem;
  margin: 0 auto;
`;

// tslint:disable-next-line:variable-name
const StyledPageComponent = styled(PageComponent)`
  @media screen { /* full page width in print */
    ${contentTextStyle}
    margin-top: ${theme.padding.page.desktop}rem;
    ${theme.breakpoints.mobile(css`
      margin-top: ${theme.padding.page.mobile}rem;
    `)}
  }

  overflow: visible; /* allow some elements, like images, videos, to overflow and be larger than the text. */

  .os-figure,
  .os-figure:last-child {
    margin-bottom: 5px; /* fix double scrollbar bug */
  }

  * {
    overflow: initial; /* rex styles default to overflow hidden, breaks content */
  }
`;

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    hash: selectNavigation.hash(state),
    page: select.page(state),
    references: select.contentReferences(state),
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(withServices(StyledPageComponent));
