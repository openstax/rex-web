import { Document, HTMLElement } from '@openstax/types/lib.dom';
import { IntlShape } from 'react-intl';
import { assertNotNull } from '../../../utils';
import { expandClosestSolution } from '../../utils/domUtils';
import { fromRelativeUrl } from '../../utils/urlUtils';
import { AppServices, MiddlewareAPI } from '../../../types';

export function linksToOtherPagesOpenInNewTab(rootEl: HTMLElement, currentPath: string) {
  rootEl.querySelectorAll('a[href]').forEach(
    (link) => {
      const pathname = fromRelativeUrl(currentPath, link.getAttribute('href') as string);

      if (pathname !== currentPath) {
        link.setAttribute('target', '_blank');
      }
    }
  );
}

// from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
// .../src/scripts/modules/media/body/body.coffee#L123
// We are passing Document because it is required to prerender.
export const transformContent = (
  document: Document,
  rootEl: HTMLElement,
  props: { intl: IntlShape, topHeadingLevel?: number },
  services: AppServices & MiddlewareAPI
) => {
  removeDocumentTitle(rootEl);
  if (props.topHeadingLevel) { changeHeadingLevels(document, rootEl, props.topHeadingLevel); }
  wrapElements(document, rootEl);
  tweakFigures(rootEl);
  fixLists(rootEl);
  wrapSolutions(document, rootEl, props.intl);
  expandSolutionForFragment(document);
  moveFootnotes(document, rootEl, props.intl);
  optimizeImages(rootEl, services);
  enhanceImagesForAccessibility(rootEl);
};

function removeDocumentTitle(rootEl: HTMLElement) {
  rootEl.querySelectorAll([
    'h1[data-type="document-title"]',
    'h2[data-type="document-title"]:not([data-rex-keep="true"])',
    'h3[data-type="document-subtitle"]',
    'div[data-type="document-title"]',
  ].join(',')).forEach((el) => el.remove());
}

// set the top heading's level to topHeadingLevel and adjust other headings accordingly
function changeHeadingLevels(document: Document, rootEl: HTMLElement, topHeadingLevel: number) {
  const headingLevels = [ 1, 2, 3, 4, 5, 6 ];
  const currentTopHeading = headingLevels.find((level) => rootEl.querySelectorAll(`h${level}`)?.length);

  if (!currentTopHeading || topHeadingLevel === currentTopHeading) {
    return;
  }

  const differenceInLevels = topHeadingLevel - currentTopHeading;

  headingLevels.forEach((level) => {
    const origTagName = `h${level}`;
    const tags = rootEl.querySelectorAll(origTagName);

    if (tags.length > 0) {
      const newTagName = `h${level + differenceInLevels}`;

      tags.forEach((tag) => {
        const contents = tag.innerHTML;
        const newTagEl = document.createElement(newTagName);

        Array.from(tag.attributes).forEach((attr) => {
          newTagEl.setAttribute(attr.name, attr.value);
        });

        newTagEl.innerHTML = contents;

        tag.replaceWith(newTagEl);
      });
    }
  });
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

function optimizeImages(rootEl: HTMLElement, services: AppServices & MiddlewareAPI) {
  const images = Array.from(rootEl.querySelectorAll('img[src^="/apps/archive"]'));

  for (const i of images) {
    const src = assertNotNull(i.getAttribute('src'), 'Somehow got a null src attribute');

    i.setAttribute('src', services.imageCDNUtils.getOptimizedImageUrl(src));
  }
}

function fixLists(rootEl: HTMLElement) {
  // Copy data-mark-prefix and -suffix from ol to li so they can be used in css
  rootEl.querySelectorAll(`ol[data-mark-prefix] > li, ol[data-mark-suffix] > li,
  [data-type="list"][data-list-type="enumerated"][data-mark-prefix] > [data-type="item"],
  [data-type="list"][data-list-type="enumerated"][data-mark-suffix] > [data-type="item"]
  `).forEach((el) => {
    const parent = assertNotNull(el.parentElement, 'list parent should always be defined');
    const markPrefix = parent.getAttribute('data-mark-prefix');
    const markSuffix = parent.getAttribute('data-mark-suffix');
    if (markPrefix) { el.setAttribute('data-mark-prefix', markPrefix); }
    if (markSuffix) { el.setAttribute('data-mark-suffix', markSuffix); }
  });
  rootEl.querySelectorAll('ol[start], [data-type="list"][data-list-type="enumerated"][start]').forEach((el) => {
    const start = assertNotNull(el.getAttribute('start'), 'expected value for list start');
    const startLessOne = parseInt(start, 10) - 1;
    const counterValue = assertNotNull(
      isNaN(startLessOne) ? null : startLessOne,
      'expected number value for list start'
    );
    el.setAttribute('style', `counter-reset: list-item ${counterValue}`);
  });
}

function wrapSolutions(document: Document, rootEl: HTMLElement, intl: IntlShape) {
  const title = intl.formatMessage({id: 'i18n:content:solution:toggle-title'});

  // Wrap solutions in a details element so "Show/Hide Solutions" work
  rootEl.querySelectorAll('.exercise .solution, [data-type="exercise"] [data-type="solution"]').forEach((el) => {
    // this markup will already be baked into content in some cases
    if (el.tagName.toLowerCase() !== 'details') {
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
    }
  });
}

function expandSolutionForFragment(document: Document) {
  // Auto expand a solution that contains the anchor the URL fragment points to
  const id = typeof(window) !== 'undefined' && window.location.hash.substr(1);

  if (id) {
    expandClosestSolution(document.getElementById(id) as HTMLElement);
  }
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

function enhanceImagesForAccessibility(rootEl: HTMLElement) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1200;

  if (!isMobile) return;

  rootEl.querySelectorAll('img').forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Open media preview');
  });
}
