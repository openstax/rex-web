import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { typesetMath } from '../../../../helpers/mathjax';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
// Temporary import from /highlights directory until we make all this logic reusable and move it to content/
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { highlightLocationFilters } from '../../highlights/selectors';
import { getHighlightLocationFilterForPage } from '../../highlights/utils';
import { formatBookData } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { receiveStudyGuidesHighlights } from '../actions';
import { StudyGuidesHighlights } from '../types';
import StudyGuides from './StudyGuides';

const hlBlue = { id: 'hl1', color: HighlightColorEnum.Blue, annotation: 'hl1' };
const hlGreen = { id: 'hl2', color: HighlightColorEnum.Green, annotation: 'hl' };
const hlPink = { id: 'hl3', color: HighlightColorEnum.Pink, annotation: 'hl' };
const hlPurple = { id: 'hl4', color: HighlightColorEnum.Purple, annotation: 'hl' };
const hlYellow = { id: 'hl5', color: HighlightColorEnum.Yellow };

describe('StudyGuides', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));

    services = createTestServices();
  });

  it('properly display summary highlights', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [
          hlBlue,
          hlGreen,
          hlPink,
          hlPurple,
          {...hlYellow, color: null} /* for coverage for css when color was not found */,
        ],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as StudyGuidesHighlights;

    store.dispatch(receiveStudyGuidesHighlights(summaryHighlights));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('add promises to promise collector at render', () => {
    const container = assertWindow().document.createElement('div');
    const spyPromiseCollectorAdd = jest.spyOn(services.promiseCollector, 'add');

    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    const summaryHighlights = {
      [pageId]: {
        [pageId]: [
          hlBlue,
          hlGreen,
          hlPink,
          hlPurple,
          {...hlYellow, color: null} /* for coverage for css when color was not found */,
        ],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as StudyGuidesHighlights;

    store.dispatch(receiveStudyGuidesHighlights(summaryHighlights));

    renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <StudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    expect(spyPromiseCollectorAdd).toHaveBeenCalledWith(allImagesLoaded(container));
    expect(spyPromiseCollectorAdd).toHaveBeenCalledWith(typesetMath(container, assertWindow()));
  });
});
