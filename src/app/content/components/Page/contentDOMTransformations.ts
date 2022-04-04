import { Document, HTMLElement } from '@openstax/types/lib.dom';
import { IntlShape } from 'react-intl';
import { assertNotNull } from '../../../utils';

// from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
// .../src/scripts/modules/media/body/body.coffee#L123
// We are passing Document because it is required to prerender.
export const transformContent = (document: Document, rootEl: HTMLElement, intl: IntlShape) => {
  removeDocumentTitle(rootEl);
  addScopeToTables(rootEl);
  wrapElements(document, rootEl);
  tweakFigures(rootEl);
  fixLists(rootEl);
  wrapSolutions(document, rootEl, intl);
  moveFootnotes(document, rootEl, intl);
  setLinksAttributes(rootEl);
};

function removeDocumentTitle(rootEl: HTMLElement) {
  rootEl.querySelectorAll([
    'h1[data-type="document-title"]',
    'h2[data-type="document-title"]',
    'h3[data-type="document-subtitle"]',
    'div[data-type="document-title"]',
  ].join(',')).forEach((el) => el.remove());
}

function addScopeToTables(rootEl: HTMLElement) {
  rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
}

// Wrap title and content elements in header and section elements, respectively
function wrapElements(document: Document, rootEl: HTMLElement) {
  rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
    [data-type="example"], [data-type="exercise"],
    [data-type="note"], [data-type="abstract"]`).forEach((el) => {

    // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
    const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

    const bodyWrap = document.createElement('section');
    bodyWrap.append(...Array.from(el.childNodes));

    const titleWrap = document.createElement('header');
    titleWrap.append(...titles);

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

function tweakFigures(rootEl: HTMLElement) {
  // move caption to bottom of figure
  rootEl.querySelectorAll('figure > figcaption').forEach((el) => {
    const parent = assertNotNull(el.parentElement, 'figcaption parent should always be defined');
    parent.classList.add('ui-has-child-figcaption');
    parent.appendChild(el);
  });
}

function fixLists(rootEl: HTMLElement) {
  // Copy data-mark-prefix and -suffix from ol to li so they can be used in css
  rootEl.querySelectorAll(`ol[data-mark-prefix] > li, ol[data-mark-suffix] > li,
  [data-type="list"][data-list-type="enumerated"][data-mark-prefix] > [data-type="item"],
  [data-type="list"][data-list-type="enumerated"][data-mark-suffix] > [data-type="item"]`).forEach((el) => {
    const parent = assertNotNull(el.parentElement, 'list parent should always be defined');
    const markPrefix = parent.getAttribute('data-mark-prefix');
    const markSuffix = parent.getAttribute('data-mark-suffix');
    if (markPrefix) { el.setAttribute('data-mark-prefix', markPrefix); }
    if (markSuffix) { el.setAttribute('data-mark-suffix', markSuffix); }
  });
  rootEl.querySelectorAll('ol[start], [data-type="list"][data-list-type="enumerated"][start]').forEach((el) => {
    el.setAttribute('style', `counter-reset: list-item ${el.getAttribute('start')}`);
  });
}

function wrapSolutions(document: Document, rootEl: HTMLElement, intl: IntlShape) {
  const title = intl.formatMessage({id: 'i18n:content:solution:toggle-title'});

  // Wrap solutions in a details element so "Show/Hide Solutions" work
  rootEl.querySelectorAll('.exercise .solution, [data-type="exercise"] [data-type="solution"]').forEach((el) => {
    el.setAttribute('aria-label', intl.formatMessage({id: 'i18n:content:solution:toggle-title'}));
    const contents = el.innerHTML;
    const detailsEl = document.createElement('details');

    Array.from(el.attributes).forEach((attr) => {
      detailsEl.setAttribute(attr.name, attr.value);
    });

    detailsEl.innerHTML = `
      <summary class="btn-link ui-toggle" title="${title}" data-content="${title}"></summary>
      <section class="ui-body" role="alert">${contents}</section>
    `;
    el.replaceWith(detailsEl);
  });
}

function moveFootnotes(document: Document, rootEl: HTMLElement, intl: IntlShape) {
  const footnotes = document.querySelectorAll('[role=doc-footnote]');
  if (!footnotes.length) { return; }

  const title = intl.formatMessage({id: 'i18n:content:footnotes:title'});
  const header = document.createElement('h3');
  header.setAttribute('data-type', 'footnote-refs-title');
  header.innerHTML = title;

  const container = document.createElement('div');
  container.setAttribute('data-type', 'footnote-refs');
  container.appendChild(header);

  const list = document.createElement('ul');
  list.setAttribute('data-list-type', 'bulleted');
  list.setAttribute('data-bullet-style', 'none');

  for (const [index, footnote] of Array.from(footnotes).entries()) {
    const counter = index + 1;

    const item = document.createElement('li');
    item.setAttribute('id', assertNotNull(footnote.getAttribute('id'), 'id of footnote was not found'));
    item.setAttribute('data-type', 'footnote-ref');

    const content = document.createElement('span');
    content.setAttribute('data-type', 'footnote-ref-content');
    content.innerHTML = footnote.innerHTML;

    const footnoteNumber = content.querySelector('[data-type="footnote-number"]');
    const number = assertNotNull(footnoteNumber, 'footnote number was not found');
    const anchor = document.createElement('a');
    anchor.setAttribute('role', 'doc-backlink');
    anchor.setAttribute('href', `#footnote-ref${counter}`);
    anchor.innerHTML = number.innerHTML;

    number.remove();

    item.appendChild(anchor);
    item.appendChild(content);

    list.appendChild(item);
    footnote.remove();
  }

  container.appendChild(list);
  rootEl.appendChild(container);

  const footnoteLinks = document.querySelectorAll('[role="doc-noteref"]');

  for (const [index, link] of Array.from(footnoteLinks).entries()) {
    const counter = index + 1;

    const sup = document.createElement('sup');
    sup.setAttribute('id', `footnote-ref${counter}`);
    sup.setAttribute('data-type', 'footnote-number');

    link.setAttribute('data-type', 'footnote-link');

    link.replaceWith(sup);
    sup.appendChild(link);
  }
}

const setLinksAttributes = (rootEl: HTMLElement) => {
  rootEl.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) { return; }
    if (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('//')) {
      // target blank and add `rel` to links that begin with: http:// https:// //
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener nofollow');
    } else if (href.startsWith('../')) {
      // target blank and allow indexing links to other books
      a.setAttribute('target', '_blank');
      a.removeAttribute('rel');
    }
  });
};
