import { IntlShape } from 'react-intl';
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
  let onHighlightSelect: jest.Mock;
  let intl: IntlShape;

  beforeEach(() => {
    const container = assertDocument().createElement('div');
    intl = { formatMessage: jest.fn() } as any as IntlShape;
    attachedManager = searchHighlightManager(container, intl);

    onHighlightSelect = jest.fn();
  });

  it('calls highlight select callback only when a new highlight is selected', () => {
    const selectedSearchResult = {highlight: 0, result: searchResults[0]};

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

    attachedManager.update(
      {searchResults, selectedResult: selectedSearchResult},
      {searchResults, selectedResult: {highlight: 0, result: searchResults[1]}},
      {forceRedraw: true, onSelect: onHighlightSelect}
    );

    expect(onHighlightSelect).toHaveBeenCalledTimes(2);
  });
});
