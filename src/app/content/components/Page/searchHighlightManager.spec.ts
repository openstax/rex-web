import { HTMLElement } from '@openstax/types/lib.dom';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { makeSearchResultHit } from '../../../../test/searchResults';
import { assertDocument } from '../../../utils';
import { SelectedResult } from '../../search/types';
import searchHighlightManager from './searchHighlightManager';
import { selectSearchResult } from '../../search/actions';

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

  let container: HTMLElement;
  let attachedManager: ReturnType<typeof searchHighlightManager>;
  let onHighlightSelect: jest.Mock;
  let selectedSearchResult: SelectedResult | null;

  beforeEach(() => {
    container = assertDocument().createElement('div');

    attachedManager = searchHighlightManager(container);
    selectedSearchResult = null;

    onHighlightSelect = jest.fn();
  });

  it('doesn\'t call onHighlightSelect when selecting the same highlight again', () => {
    selectedSearchResult = {highlight: 0, result: searchResults[0]};

    attachedManager.update(
      {searchResults, selectedResult: null },
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, onSelect: onHighlightSelect}
    );

    expect(onHighlightSelect).toHaveBeenCalledTimes(1);

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult},
      {searchResults, selectedResult: selectedSearchResult},
      {forceRedraw: true, onSelect: onHighlightSelect}
    );

    expect(onHighlightSelect).toHaveBeenCalledTimes(1);
  });
});
