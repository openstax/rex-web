import { book, page } from '../../../../test/mocks/archiveLoader';
import { makeSearchResultHit } from '../../../../test/searchResults';
import * as domUtils from '../../../domUtils';
import { assertDocument } from '../../../utils';
import untypedAttachHighlight from '../utils/attachHighlight';
import searchHighlightManager from './searchHighlightManager';

jest.mock('../utils/attachHighlight');

const attachHighlight = untypedAttachHighlight as unknown as jest.SpyInstance;

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

    attachHighlight.mockImplementation((hl) => {
      hl.elements = [{}];
      hl.focus = jest.fn();
      return hl;
    });

    onClearError = jest.fn();
    onSetError = jest.fn();
  });

  it('calls onClearError callback when there is no current.selectedResult', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult},
      {searchResults, selectedResult: null},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('calls onClearError callback when found first selected highlight', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: null},
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('noop if selectedResult did not changed and forceRedraw is set to false', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult},
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: false, setError: onSetError, clearError: onClearError}
    );

    expect(onSetError).toHaveBeenCalledTimes(0);
    expect(onClearError).toHaveBeenCalledTimes(0);
  });

  it('do not scroll twice to the same search highlight', async() => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};
    const spyOnScrollTo = jest.spyOn(domUtils, 'scrollTo');

    attachedManager.update(
      {searchResults, selectedResult: null},
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    // wait for allImagesLoaded
    await Promise.resolve();

    expect(spyOnScrollTo).toHaveBeenCalledTimes(1);

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult},
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, setError: onSetError, clearError: onClearError}
    );

    // wait for allImagesLoaded
    await Promise.resolve();

    expect(spyOnScrollTo).toHaveBeenCalledTimes(1);
  });
});
