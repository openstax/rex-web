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
import { receiveHighlightsTotalCounts, receiveSummaryHighlights, setSummaryFilters } from '../actions';
import { highlightLocationFilters } from '../selectors';
import { SummaryHighlights } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import Highlights, { SectionHighlights } from './Highlights';
import { HighlightContentWrapper, HighlightSection, LoaderWrapper } from './ShowMyHighlightsStyles';

const hlBlue = { id: 'hl1', color: HighlightColorEnum.Blue, annotation: 'hl1' };
const hlGreen = { id: 'hl2', color: HighlightColorEnum.Green, annotation: 'hl' };
const hlPink = { id: 'hl3', color: HighlightColorEnum.Pink, annotation: 'hl' };
const hlPurple = { id: 'hl4', color: HighlightColorEnum.Purple, annotation: 'hl' };
const hlYellow = { id: 'hl5', color: HighlightColorEnum.Yellow };

describe('Highlights', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let consoleError: jest.SpyInstance;
  let store: Store;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
    store = createTestStore();

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('properly display summary highlights', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: 5,
      [location!.id]: 2,
    }));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, null));

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

    // If locationId is same as pageId section title is not duplicated.
    expect(sections[0].findAllByType(HighlightSection).length).toEqual(0);

    const pageHighlights = summaryHighlights[pageId][pageId];
    expect(firstSectionHighlights[0].props.color).toEqual(pageHighlights[0].color);
    expect(firstSectionHighlights[1].props.color).toEqual(pageHighlights[1].color);
    expect(firstSectionHighlights[2].props.color).toEqual(pageHighlights[2].color);
    expect(firstSectionHighlights[3].props.color).toEqual(pageHighlights[3].color);
    expect(firstSectionHighlights[4].props.color).toEqual(pageHighlights[4].color);

    const pageInChapterHighlights = summaryHighlights[location!.id][pageInChapter.id];
    expect(secondSectionHighlights[0].props.color).toEqual(pageInChapterHighlights[0].color);
    expect(secondSectionHighlights[1].props.color).toEqual(pageInChapterHighlights[1].color);
  });

  it('show loading state on filters change', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: 5,
      [location!.id]: 2,
    }));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
      store.dispatch(receiveSummaryHighlights(summaryHighlights, null));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);

    expect(component.root.findAllByType(LoaderWrapper).length).toEqual(0);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    });

    const isLoading = component.root.findByType(LoaderWrapper);
    expect(isLoading).toBeDefined();
  });

  it('show no highlights tip when there are no highlights for selected filters', () => {
    store.dispatch(receiveHighlightsTotalCounts({
      pageId: 5,
      pageId2: 2,
    }));
    store.dispatch(setSummaryFilters({locationIds: ['not-in-book']}));
    store.dispatch(receiveSummaryHighlights({}, null));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    expect(component.root.findByProps({ id: 'i18n:toolbar:highlights:popup:heading:no-highlights-tip' }))
      .toBeDefined();
  });

  it('show add highlight message when there are no highlights in specific book', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    expect(component.root.findByProps({ id: 'i18n:toolbar:highlights:popup:body:add-highlight' }))
      .toBeDefined();
  });

  it('throws an error if page from summary highlights wasn\'t found in book', () => {
    store.dispatch(receivePage({...pageInChapter, references: []}));
    const pageId = stripIdVersion(pageInChapter.id);
    const locations = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locations, pageInChapter.id);
    store.dispatch(receiveHighlightsTotalCounts({ [location!.id]: 5 }));

    const summaryHighlights = {
      [location!.id]: {
        'page-not-in-given-section': [hlBlue],
      },
    } as unknown as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [pageId]}));
      store.dispatch(receiveSummaryHighlights(summaryHighlights, null));
    });

    consoleError.mockReturnValueOnce(null);

    expect(() => renderer.create(<Provider store={store}>
        <MessageProvider>
          <Highlights/>
        </MessageProvider>
      </Provider>)
    ).toThrow();
  });
});
