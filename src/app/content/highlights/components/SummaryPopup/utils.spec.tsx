import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../../test/TestContainer';
import { locationChange } from '../../../../navigation/actions';
import { useCreateHighlightLink } from './utils';

jest.mock('../../../utils/urlUtils', () => ({
  ...jest.requireActual('../../../utils/urlUtils'),
  getBookPageUrlAndParams: () => ({ url: 'mocked/BookPageUrl/And/Params/' }),
}));

const mockHighlight = {
  anchor: 'some-element-id',
  id: 'highlight-id',
  sourceId: archiveBook.tree.contents[0].id,
} as Highlight;

describe('createHighlightLink', () => {
  // tslint:disable-next-line: variable-name
  let Component: React.ComponentType<{book?: typeof archiveBook}>;
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();

    Component = ({ book }: { book?: typeof archiveBook}) => {
      const link = useCreateHighlightLink(mockHighlight, book);
      return <span data-testid='link'>{link}</span>;
    };
  });

  it('creates valid link for highlight', () => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));

    const data = {
      'content-style': store.getState().navigation.query['content-style'],
      'target': JSON.stringify({ id: mockHighlight.id, type: 'highlight' }),
    };
    const target = queryString.stringify(data) + `#${mockHighlight.anchor}`;
    const component = renderer.create(<TestContainer store={store}>
      <Component book={archiveBook} />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    const link = component.root.findByProps({ 'data-testid': 'link' });
    expect(link.children[0]).toEqual(`mocked/BookPageUrl/And/Params/?${target}`);
  });

  it('creates link when book is not passed for highlight', () => {
    const data = {
      target: JSON.stringify({ id: mockHighlight.id, type: 'highlight' }),
    };
    const target = queryString.stringify(data) + `#${mockHighlight.anchor}`;
    const component = renderer.create(<TestContainer>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    const link = component.root.findByProps({ 'data-testid': 'link' });
    expect(link.children[0]).toEqual(`?${target}`);
  });
});
