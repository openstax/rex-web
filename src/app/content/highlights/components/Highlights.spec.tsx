import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { highlightLocations } from '../selectors';
import { SummaryHighlights } from '../types';
import { getHighlightLocationForPage } from '../utils';
import Highlights, { SectionHighlights } from './Highlights';
import { HighlightContentWrapper, HighlightsChapter, LoaderWrapper } from './ShowMyHighlightsStyles';

const hlBlue = { id: 'hl1', color: HighlightColorEnum.Blue, annotation: 'hl1' };
const hlGreen = { id: 'hl2', color: HighlightColorEnum.Green, annotation: 'hl' };
const hlPink = { id: 'hl3', color: HighlightColorEnum.Pink, annotation: 'hl' };
const hlPurple = { id: 'hl4', color: HighlightColorEnum.Purple, annotation: 'hl' };
const hlYellow = { id: 'hl5', color: HighlightColorEnum.Yellow };

describe('Highlights', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;

  beforeEach(() => {
    store = createTestStore();

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));
  });

  it('properly display summary highlights', () => {
    const pageId = stripIdVersion(page.id);
    const locations = highlightLocations(store.getState());
    const chapter = getHighlightLocationForPage(locations, pageInChapter);
    expect(chapter).toBeDefined();

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [chapter!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);
    const firstSectionHighlights = sections[0].findAllByType(HighlightContentWrapper);
    const secondSectionHighlights = sections[1].findAllByType(HighlightContentWrapper);
    expect(firstSectionHighlights.length).toEqual(5);
    expect(secondSectionHighlights.length).toEqual(2);

    // If locationId is same as pageId chapter title is not duplicated.
    expect(sections[0].findAllByType(HighlightsChapter).length).toEqual(0);
    expect(sections[1].findByType(HighlightsChapter).props.dangerouslySetInnerHTML.__html)
      .toEqual(chapter!.title);

    const pageHighlights = summaryHighlights[pageId][pageId];
    expect(firstSectionHighlights[0].props.color).toEqual(pageHighlights[0].color);
    expect(firstSectionHighlights[1].props.color).toEqual(pageHighlights[1].color);
    expect(firstSectionHighlights[2].props.color).toEqual(pageHighlights[2].color);
    expect(firstSectionHighlights[3].props.color).toEqual(pageHighlights[3].color);
    expect(firstSectionHighlights[4].props.color).toEqual(pageHighlights[4].color);

    const pageInChapterHighlights = summaryHighlights[chapter!.id][pageInChapter.id];
    expect(secondSectionHighlights[0].props.color).toEqual(pageInChapterHighlights[0].color);
    expect(secondSectionHighlights[1].props.color).toEqual(pageInChapterHighlights[1].color);
  });

  it('show loading state when on filters change', () => {
    const pageId = stripIdVersion(page.id);
    const locations = highlightLocations(store.getState());
    const chapter = getHighlightLocationForPage(locations, pageInChapter);
    expect(chapter).toBeDefined();

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [chapter!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);

    expect(component.root.findAllByType(LoaderWrapper).length).toEqual(0);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({
        colors: [],
        locationIds: [],
      }));
    });

    const isLoading = component.root.findByType(LoaderWrapper);
    expect(isLoading).toBeDefined();
  });
});
