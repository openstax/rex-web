import Highlighter, { Highlight } from '@openstax/highlighter';
import { SearchResult } from '@openstax/open-search-client';
import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement } from '@openstax/types/lib.dom';
import { Location } from 'history';
import sortBy from 'lodash/fp/sortBy';
import { RangyRange, TextRange } from 'rangy';
import rangy from '../../../helpers/rangy';
import { findTextInRange } from '../../../helpers/rangy';
import { ArchiveTree, LinkedArchiveTree, LinkedArchiveTreeNode } from '../types';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage, linkArchiveTree } from '../utils/archiveTreeUtils';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';
import { isSearchResultChapter } from './guards';
import { SearchResultContainer, SearchResultPage } from './types';

export const getFirstResultPage = (book: {tree: ArchiveTree}, results: SearchResult): SearchResultPage | undefined => {
  const [result] = getFormattedSearchResults(book.tree, results);
  const getFirstResult = (container: SearchResultContainer): SearchResultPage => isSearchResultChapter(container)
    ? getFirstResult(container.contents[0])
    : container;

  return result && getFirstResult(result);
};

export const getFormattedSearchResults = (bookTree: ArchiveTree, searchResults: SearchResult) =>
  filterTreeForSearchResults(linkArchiveTree(bookTree), searchResults);

export const getSearchResultsForPage = (page: {id: string}, results: SearchResult) =>
  sortBy('source.pagePosition',
    results.hits.hits.filter((result) => stripIdVersion(result.source.pageId) ===  stripIdVersion(page.id))
  );

const filterTreeForSearchResults = (
  node: LinkedArchiveTree,
  searchResults: SearchResult
): SearchResultContainer[]  => {
  const containers: SearchResultContainer[] = [];
  const linkContents = (parent: LinkedArchiveTree): LinkedArchiveTreeNode[] =>
    parent.contents.map((child) => ({...child, parent}));

  for (const child of linkContents(node)) {
    if (archiveTreeSectionIsPage(child)) {
      const results = getSearchResultsForPage(child, searchResults);

      if (results.length > 0) {
        containers.push({...child, results});
      }
    } else if (archiveTreeSectionIsChapter(child)) {
      const contents = filterTreeForSearchResults(child, searchResults);

      if (contents.length > 0) {
        containers.push({...child, contents});
      }
    } else { // must be an non-chapter ArchiveTree
      containers.push(...filterTreeForSearchResults(child, searchResults));
    }
  }

  return containers;
};

export const getIndexData = (indexName: string) => {
  const tail = getIdVersion(indexName);

  if (!tail) {
    throw new Error(`impropertly formatted index string: "${indexName}"`);
  }

  const [version, indexingStrategy] = tail.split('_');

  return {
    bookId: stripIdVersion(indexName),
    indexingStrategy,
    version,
  };
};

export const getSearchFromLocation = (location: Location) => location.state && location.state.search;

const getHighlightRanges = (element: HTMLElement, highlight: string): Array<RangyRange & TextRange> => {
  const elementRange = rangy.createRange();
  elementRange.selectNodeContents(element);

  // search replaces non-text inline elements with `…`, which breaks the text matchin in the element,
  // luckily you can't actually search for non-text elements, so they won't be in a matches
  // only in surrounding context, so find matches in each part separately
  return highlight.split('…')
    .map((part) => {
      const partRange = rangy.createRange();
      const partMatches = part.match(/<strong>.*?<\/strong>(\s*<strong>.*?<\/strong>)*/g) || [];

      partRange.findText(part.replace(/<\/?strong>|\n/g, ''), {
        withinRange: elementRange.cloneRange(),
      });

      return partMatches
        .map((match) => match.replace(/<\/?strong>|\n/g, ''))
        .map((match) => findTextInRange(partRange, match))
        .reduce((flat, sub) => [...flat, ...sub], [])
      ;
    })
    .reduce((flat, sub) => [...flat, ...sub], [])
  ;
};

export const highlightResults = (highlighter: Highlighter, results: SearchResultHit[]) => {
  for (const hit of results) {
    const element = highlighter.getReferenceElement(hit.source.elementId) as HTMLElement;

    if (!element) {
      return;
    }

    for (const highlight of hit.highlight.visibleContent) {

      getHighlightRanges(element, highlight).forEach((range) => {
        try {
          highlighter.highlight(
            new Highlight(range.nativeRange, range.toString())
          );
        } catch (error) {
          console.error(error); // tslint:disable-line:no-console
        }
      });
    }
  }
};
