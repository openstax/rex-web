import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { DropdownToggle } from '../../../components/Dropdown';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { StyledDetails, StyledSectionItem, StyledSummary } from '../../components/popUp/ChapterFilter';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';
import { PracticeQuestionsLocationFilters } from '../types';
import Filters from './Filters';

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;
  let render: () => JSX.Element;
  const mockLocationFilters = new Map([
    ['chapterId', {
      chapter: { id: 'chapterId', title: 'chapterId' },
      sections: [{ id: 'section1', title: 'section1' }, { id: 'section2', title: 'section2' }],
    }],
    ['chapterId2', {
      chapter: { id: 'chapterId2', title: 'chapterId2' },
      sections: [{ id: 'section21', title: 'section21' }, { id: 'section22', title: 'section22' }],
    }],
  ]) as PracticeQuestionsLocationFilters;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    dispatch = jest.spyOn(store, 'dispatch');
    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>;
  });

  it('ChapterFilterWithToggling matches snapshot when it is closed', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({ id: 'section21', parent: { id: 'chapterId2' } } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
    mockSection.mockReset();
  });

  it('ChapterFilterWithToggling matches snapshot when open without selected section', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
  });

  it('ChapterFilterWithToggling matches snapshot when open with selected section', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({ id: 'section21', parent: { id: 'chapterId2' } } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
    mockSection.mockReset();
  });

  it('ChapterFilter with chapters and sections works properly', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({ id: 'section21', parent: { id: 'chapterId2' } } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const [details1, details2] = component.root.findAllByType(StyledDetails);
    expect(details1.props.open).toEqual(false);
    expect(details2.props.open).toEqual(true);

    const mockPreventDefault = jest.fn();

    renderer.act(() => {
      const summary = details2.findByType(StyledSummary);
      summary.props.onClick({ preventDefault: mockPreventDefault });
    });

    expect(details1.props.open).toEqual(false);
    expect(details2.props.open).toEqual(false);

    renderer.act(() => {
      const summary = details1.findByType(StyledSummary);
      summary.props.onClick({ preventDefault: mockPreventDefault });
    });

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(details1.props.open).toEqual(true);
    expect(details2.props.open).toEqual(false);

    renderer.act(() => {
      const [section1] = details1.findAllByType(StyledSectionItem);
      section1.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection({ id: 'section1', title: 'section1' } as any));

    mockFilters.mockReset();
    mockSection.mockReset();
  });
});
