import { book, page } from '../../../../test/mocks/archiveLoader';
import { makeSearchResultHit } from '../../../../test/searchResults';
import { assertDocument } from '../../../utils';
import searchHighlightManager from './searchHighlightManager';

describe('searchHighlightManager', () => {
  const searchResults = [
    makeSearchResultHit({
      book,
      highlights: [
        'highlight <strong>number</strong> 1',
        'highlight <strong>number</strong> 2',
      ],
      page,
    }),
    makeSearchResultHit({book, page, highlights: ['highlight <strong>number</strong> 3']}),
  ];

  let attachedManager: ReturnType<typeof searchHighlightManager>;
  let onClearError: jest.Mock;
  let onSetError: jest.Mock;

  beforeEach(() => {
    const container = assertDocument().createElement('div');
    for (const hit of searchResults) {
      const highlight = assertDocument().createElement('p');
      for (const str of hit.highlight.visibleContent) {
        const span = assertDocument().createElement('span');
        span.innerHTML = str;
        highlight.append(str);
      }
      highlight.setAttribute('id', hit.source.elementId);
      container.append(highlight);
    }
    attachedManager = searchHighlightManager(container);

    onClearError = jest.fn();
    onSetError = jest.fn();
  });

  it('calls onClearError callback when there is no current.selectedResult', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult },
      {searchResults, selectedResult: null},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it.only('calls onClearError callback when found first selected highlight', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};
    console.log('searchResults', searchResults)
    attachedManager.update(
      {searchResults, selectedResult: null },
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('noop if selectedResult did not changed', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult },
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    expect(onSetError).toHaveBeenCalledTimes(0);
    expect(onClearError).toHaveBeenCalledTimes(0);
  });
});
