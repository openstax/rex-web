import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { receiveLoggedOut, receiveUser } from '../../../auth/actions';
import { DropdownToggle } from '../../../components/Dropdown';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import FiltersList from '../../components/popUp/FiltersList';
import { formatBookData, stripIdVersion } from '../../utils';
import { printStudyGuides, receiveStudyGuidesTotalCounts, receiveSummaryStudyGuides } from '../actions';
import Filters from './Filters';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';
import UsingThisGuideBanner, { CloseIcon as UTGCloseIcon} from './UsingThisGuide/UsingThisGuideBanner';

jest.mock('../../components/popUp/ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;
  const window = assertWindow();
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    services = createTestServices();

    window.print = jest.fn();

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
      colorFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correct label keys for color dropdown', () => {
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const labelBlueKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:blue' });
    const labelGreenKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:green' });
    const labelPurpleKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:purple' });
    const labelYellowKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:yellow' });

    expect(labelBlueKey).toBeTruthy();
    expect(labelGreenKey).toBeTruthy();
    expect(labelPurpleKey).toBeTruthy();
    expect(labelYellowKey).toBeTruthy();
  });

  it('does renders ConnectedFilterList if user is logged in', () => {
    store.dispatch(receiveUser({} as any));
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

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

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    expect(() => component.root.findByType(FiltersList)).toThrow();
  });

  describe('PrintButton', () => {
    it('triggers print immediately if nothing left to load', () => {
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Filters />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).not.toHaveBeenCalledWith(printStudyGuides());
      expect(window.print).toHaveBeenCalled();
    });

    it('loads remaining highlights before printing', () => {
      store.dispatch(receiveSummaryStudyGuides({}, {pagination: {} as any}));

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Filters />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).toHaveBeenCalledWith(printStudyGuides());
    });
  });

  describe('Using This Guide Button', () => {
    it('renders button and banner when button is clicked and closes correctly', () => {
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Filters />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const UTGbutton = component.root.findByType(UsingThisGuideButton);

      renderer.act(() => {
        UTGbutton.props.onClick();
      });

      expect(component.root.findByType(UsingThisGuideBanner)).toBeTruthy();

      const UTGcloseButton = component.root.findByType(UTGCloseIcon);

      renderer.act(() => {
        UTGcloseButton.props.onClick();
      });

      expect(() => { component.root.findByType(UsingThisGuideBanner); }).toThrow();
    });
  });
});
