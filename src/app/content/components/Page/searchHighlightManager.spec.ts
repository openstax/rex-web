import UntypedHighlighter, { Highlight } from '@openstax/highlighter';
import { IntlShape } from 'react-intl';
import { book, page } from '../../../../test/mocks/archiveLoader';
import { makeSearchResultHit } from '../../../../test/searchResults';
import { assertDocument } from '../../../utils';
import * as utils from '../../search/utils';
import searchHighlightManager from './searchHighlightManager';

jest.mock('@openstax/highlighter');

UntypedHighlighter.prototype.eraseAll = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;

beforeEach(() => {
  jest.resetAllMocks();
});

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
  let solutionButtonClick: jest.SpyInstance;

  beforeEach(() => {
    const container = assertDocument().createElement('div');
    const collapsedSolution = assertDocument().createElement('div');
    collapsedSolution.setAttribute('data-type', 'solution');
    collapsedSolution.setAttribute('aria-expanded', 'false');
    const button = assertDocument().createElement('button');
    collapsedSolution.append(button);

    solutionButtonClick = jest.spyOn(button, 'click');

    const hl1 = assertDocument().createElement('span');
    const hl2 = assertDocument().createElement('span');
    const hl3 = assertDocument().createElement('span');

    collapsedSolution.append(hl1, hl2);

    intl = { formatMessage: jest.fn() } as any as IntlShape;
    attachedManager = searchHighlightManager(container, intl);

    const createMockHl = (element: HTMLElement): Highlight => ({
      addFocusedStyles: jest.fn(),
      elements: [element],
    } as any);

    jest.spyOn(utils, 'highlightResults')
      .mockImplementation(() => [
        {
          highlights: { 0: [createMockHl(hl1)], 1: [createMockHl(hl2)] } as any as Record<number, Highlight[]>,
          result: searchResults[0],
        },
        {
          highlights: { 0: [createMockHl(hl3)] } as any as Record<number, Highlight[]>,
          result: searchResults[0],
        },
      ]);

    onHighlightSelect = jest.fn();
  });

  const testName = 'calls highlight select callback only when a new highlight is selected '
    + '+ toggle solution if highlight is inside';
  it(testName, () => {
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
    expect(solutionButtonClick).toHaveBeenCalledTimes(2);
  });

  it('handles highlight.formatMessage', () => {
    const options = Highlighter.mock.calls[0][1];
    options.formatMessage({ id: 'asdfg' });
    expect(intl.formatMessage).toHaveBeenCalledWith({ id: 'asdfg' }, { style: 'search' });
  });
});
