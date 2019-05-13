import { Element } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { Consumer, MAIN_CONTENT_ID } from '../context/SkipToContent';
import { assertDefined } from '../utils';

interface PropTypes {
  className?: string;
}

class MainContent extends Component<PropTypes> {

  private rootEl: Element | null = null;

  public componentDidMount() {
    if (this.rootEl) { this.addGenericJs(this.rootEl); }
  }

  public componentDidUpdate() {
    if (this.rootEl) { this.addGenericJs(this.rootEl); }
  }

  // from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
  // .../src/scripts/modules/media/body/body.coffee#L123
  public addGenericJs(rootEl: Element) {
    this.addScopeToTables(rootEl);
    this.wrapElements(rootEl);
    this.tweakFigures(rootEl);
    this.addNoFollow(rootEl);
    this.fixLists(rootEl);
  }

  public addScopeToTables(rootEl: Element) {
    rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
  }

  // Wrap title and content elements in header and section elements, respectively
  public wrapElements(rootEl: Element) {
  rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
    [data-type="example"], [data-type="exercise"],
    [data-type="note"], [data-type="abstract"]`).forEach((el) => {

      const titles = el.querySelectorAll(':scope > .title, :scope > [data-type="title"], :scope > .os-title');

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

  public tweakFigures(rootEl: Element) {
    // move caption to bottom of figure
    rootEl.querySelectorAll('figure > figcaption')
    .forEach((el) => el.parentElement
      && el.parentElement.classList.add('ui-has-child-figcaption')
      && el.parentElement.appendChild(el));
  }

  // Add nofollow to external user-generated links
  public addNoFollow(rootEl: Element) {
    rootEl.querySelectorAll('a[href^="http:"], a[href^="https:"], a[href^="//"]')
    .forEach((el) => el.setAttribute('rel', 'nofollow'));
  }

  public fixLists(rootEl: Element) {
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

  public render() {
    const {className, children} = this.props;
    return <Consumer>
      {({registerMainContent}) => <div
        className={className}
        id={MAIN_CONTENT_ID}
        ref={(el) => {
          registerMainContent(el);
          this.rootEl = el as Element;
        }}
        tabIndex={-1}
      >
        {children}
      </div>}
    </Consumer>;
  }
}

export default MainContent;
