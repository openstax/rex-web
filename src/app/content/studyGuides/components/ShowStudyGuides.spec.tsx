import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { renderToDom } from '../../../../test/reactutils';
import GoToTopButton from '../../../components/GoToTopButton';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { loadMoreStudyGuides } from '../actions';
import * as selectors from '../selectors';
import ShowStudyGuides, { StudyGuidesBody } from './ShowStudyGuides';

describe('ShowStudyGuides', () => {
  let store: Store;
  let window: Window;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();

    window = assertWindow();
  });

  it('doesn\'t request more if not at bottom', () => {
    const container = window.document.createElement('div');

    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 100 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).not.toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('dispatch loadMoreStudyGuides when scrolling down', () => {
    const container = window.document.createElement('div');

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(true);

    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('do not requests more highlights when there is no more results', () => {
    const container = window.document.createElement('div');
    const dispatch = spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(false);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).not.toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('do not requests more highlights when already loading', () => {
    const container = window.document.createElement('div');
    const dispatch = jest.spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'summaryIsLoading')
      .mockReturnValue(true);

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(true);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    dispatch.mockClear();

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).toHaveBeenCalledTimes(0);
  });

  it('shows back to top button on scroll and works on click', async() => {
    const container = window.document.createElement('div');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    Object.defineProperty(container, 'height', { value: 1000 });
    Object.defineProperty(container, 'scrollTop', { value: 10, writable: true });

    const sgWrapper = component.root.findByType(StudyGuidesBody);
    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    const backToTop = component.root.findByType(GoToTopButton);
    // this assertion isn't really necessary but makes the test intentions easier to read
    expect(backToTop).toBeTruthy();

    renderer.act(() => {
      backToTop.props.onClick();
    });

    expect(container.scrollTop).toBe(0)
    expect(() => component.root.findByType(GoToTopButton)).toThrow();
  });

  it('does not scroll to top without ref', () => {
    const container = window.document.createElement('div');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <ShowStudyGuides />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    Object.defineProperty(container, 'height', { value: 1000 });
    Object.defineProperty(container, 'scrollTop', { value: 10, writable: true });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    const backToTop = component.root.findByType(GoToTopButton);

    if (!backToTop) {
      return expect(backToTop).toBeTruthy();
    }

    ReactDOM.unmountComponentAtNode(container);

    renderer.act(() => {
      backToTop.props.onClick();
    });

    expect(container.scrollTop).toBe(10)
    expect(() => component.root.findByType(GoToTopButton)).toThrow();
  });
});
