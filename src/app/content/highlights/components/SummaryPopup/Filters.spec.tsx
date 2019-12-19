import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import { stripIdVersion } from '../../../utils/idUtils';
import { setSummaryFilters } from '../../actions';
import Filters from './Filters';
import { FiltersListChapter, FiltersListColor } from './FiltersList';

jest.mock('./ColorFilter', () => (props: any) => <div mock-color-filter {...props} />);
jest.mock('./ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('updates on summary filters change', () => {
    store.dispatch(receiveBook(book));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(5);

    const pageId = stripIdVersion(book.tree.contents[0].id);
    const chapterId = stripIdVersion(book.tree.contents[1].id);
    renderer.act(() => {
      store.dispatch(setSummaryFilters({
        colors: [HighlightColorEnum.Blue, HighlightColorEnum.Yellow],
        locationIds: [pageId, chapterId],
      }));
    });

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(2);
    expect(chapterFilters[0].props.chapterId).toEqual(pageId);
    expect(chapterFilters[1].props.chapterId).toEqual(chapterId);
    expect(colorFilters.length).toEqual(2);
    expect(colorFilters[0].props.color).toEqual(HighlightColorEnum.Blue);
    expect(colorFilters[1].props.color).toEqual(HighlightColorEnum.Yellow);
  });
});
