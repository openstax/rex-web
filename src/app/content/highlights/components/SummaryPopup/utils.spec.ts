import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import { book } from '../../../../../test/mocks/archiveLoader';
import { createHighlightLink } from './utils';

jest.mock('../../../utils/urlUtils', () => ({
  ...jest.requireActual('../../../utils/urlUtils'),
  getBookPageUrlAndParams: () => ({ url: 'mocked/BookPageUrl/And/Params/' }),
}));

describe('createHighlightLink', () => {
  const mockHighlight = {
    anchor: 'some-element-id',
    id: 'highlight-id',
    sourceId: book.tree.contents[0].id,
  } as Highlight;

  it('creates valid link for highlight', () => {
    const data = {
      target: JSON.stringify({ id: mockHighlight.id, type: 'highlight', elementId: mockHighlight.anchor }),
    };
    const target = queryString.stringify(data) + `#${mockHighlight.anchor}`;
    expect(createHighlightLink(mockHighlight, book))
      .toEqual(`mocked/BookPageUrl/And/Params/?${target}`);
  });

  it('creates link when book is not passed for highlight', () => {
    const data = {
      target: JSON.stringify({ id: mockHighlight.id, type: 'highlight', elementId: mockHighlight.anchor }),
    };
    const target = queryString.stringify(data) + `#${mockHighlight.anchor}`;
    expect(createHighlightLink(mockHighlight)).toEqual(`?${target}`);
  });
});
