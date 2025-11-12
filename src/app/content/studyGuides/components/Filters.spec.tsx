import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import queryString from 'query-string';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { receiveLoggedOut, receiveUser } from '../../../auth/actions';
import Checkbox from '../../../components/Checkbox';
import { DropdownToggle } from '../../../components/Dropdown';
import { locationChange, replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook } from '../../actions';
import FiltersList, { FiltersListColor } from '../../components/popUp/FiltersList';
import { modalQueryParameterName } from '../../constants';
import * as routes from '../../routes';
import { formatBookData, stripIdVersion } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import {
  loadMoreStudyGuides,
  openStudyGuides,
  printStudyGuides,
  receiveStudyGuidesTotalCounts,
  receiveSummaryStudyGuides,
} from '../actions';
import { colorfilterLabels, modalUrlName } from '../constants';
import * as selectors from '../selectors';
import Filters from './Filters';

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  const window = assertWindow();
  const book = formatBookData(archiveBook, mockCmsBook);
  const mockMatch = {
    params: {
      book: {
        slug: book.slug,
      },
      page : {
        slug: book.tree.contents[0].slug,
      },
    },
    route: routes.content,
    state: {},
  };
  const colors = Array.from(colorfilterLabels);

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    window.print = jest.fn();

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot with UTG banner open (opened initially)', () => {
    const chapterId = stripIdVersion(book.tree.contents[2].id);

    // set filters
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        // tslint:disable-next-line:max-line-length
        search: `?${queryString.stringify({colors})}&locationIds=${chapterId}&modal=${modalUrlName}`,
      },
    } as any));

    store.dispatch(receiveBook(book));
    store.dispatch(receiveStudyGuidesTotalCounts({
      [chapterId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }));
    store.dispatch(loadMoreStudyGuides());

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    renderer.act(() => {
      const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
      colorFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correct label keys for color dropdown', () => {
    // set filters
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        // tslint:disable-next-line:max-line-length
        search: `?${queryString.stringify({colors})}&modal=${modalUrlName}`,
      },
      query: {
        colors,
        [modalQueryParameterName]: modalUrlName,
      },
    } as any));
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }));

    jest.spyOn(selectors, 'studyGuidesOpen').mockReturnValue(true);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const labelBlueKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:blue' });
    const labelGreenKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:green' });
    const labelPurpleKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:purple' });
    const labelYellowKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:yellow' });

    expect(labelBlueKey).toBeTruthy();
    expect(labelGreenKey).toBeTruthy();
    expect(labelPurpleKey).toBeTruthy();
    expect(labelYellowKey).toBeTruthy();
  });

  it('renders ConnectedFilterList if user is logged in', () => {
    store.dispatch(receiveUser({} as any));
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    expect(() => component.root.findByType(FiltersList)).not.toThrow();
  });

  it('does not render ConnectedFilterList if user is logged out', () => {
    store.dispatch(receiveLoggedOut());
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    expect(() => component.root.findByType(FiltersList)).toThrow();
  });

  it('dispatches history replace on selecting colors and chapters', () => {
    const chapter = findArchiveTreeNodeById(book.tree, 'testbook1-testchapter1-uuid')!;
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    // set summary filters
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        // tslint:disable-next-line:max-line-length
        search: `?${queryString.stringify({colors})}&locationIds=${chapter.id}&modal=${modalUrlName}`,
      },
    } as any));

    store.dispatch(receiveBook(book));
    store.dispatch(receiveStudyGuidesTotalCounts({
      [chapter.id]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    store.dispatch(openStudyGuides());
    dispatch.mockClear();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);

    renderer.act(() => {
      colorFilterToggle.props.onClick();
    });

    const [yellowCheckbox] = component.root.findAllByType(Checkbox);

    renderer.act(() => {
      yellowCheckbox.props.onChange();
      colorFilterToggle.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(
      replace(mockMatch, {
        search: `colors=green&colors=blue&colors=purple&locationIds=${chapter.id}&modal=${modalUrlName}`,
      })
    );

    dispatch.mockClear();

    renderer.act(() => {
      chapterFilterToggle.props.onClick();
    });

    const [ch1] = component.root.findAllByType(Checkbox);

    renderer.act(() => {
      ch1.props.onChange();
    });

    expect(dispatch).toHaveBeenCalledWith(
      replace(mockMatch, {
        search: `colors=yellow&colors=green&colors=blue&colors=purple&locationIds&modal=${modalUrlName}`,
      })
    );
  });

  it('dispatches history replace when removing selected colors from FiltersList', () => {
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    store.dispatch(receiveUser({} as any));
    // set filters
    store.dispatch(locationChange({
      action: 'REPLACE',
      location: {
        // tslint:disable-next-line:max-line-length
        search: `?${queryString.stringify({colors})}&modal=${modalUrlName}`,
      },
    } as any));

    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const filtersList = component.root.findByType(FiltersList);

    const [green] = filtersList.findAllByType(FiltersListColor);

    dispatch.mockClear();

    renderer.act(() => {
      green.props.onRemove();
    });

    const historyReplace = replace(mockMatch, {
      search: 'colors=yellow&colors=blue&colors=purple&locationIds&modal=SG',
    });
    expect(dispatch).toHaveBeenCalledWith(historyReplace);
  });

  describe('PrintButton', () => {
    it('triggers print immediately if nothing left to load', () => {
      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).not.toHaveBeenCalledWith(printStudyGuides());
      expect(window.print).toHaveBeenCalled();
    });

    it('loads remaining highlights before printing', () => {
      store.dispatch(receiveSummaryStudyGuides({}, {pagination: {} as any}));

      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).toHaveBeenCalledWith(printStudyGuides());
    });
  });
});
