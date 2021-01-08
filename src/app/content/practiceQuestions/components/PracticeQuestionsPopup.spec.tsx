import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { renderToDom } from '../../../../test/reactutils';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import * as navigation from '../../../navigation/selectors';
import { Store } from '../../../types';
import { assertNotNull, assertWindow } from '../../../utils';
import { initialState as initialContentState } from '../../reducer';
import { content } from '../../routes';
import { nextQuestion } from '../actions';
import * as pqSelectors from '../selectors';
import PracticeQuestionsPopup from './PracticeQuestionsPopup';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: any) => children,
}));

const mockMatch = {
  params: {
    book: { slug: 'book' },
    page: { slug: 'page' },
  },
  route: content,
};

describe('PracticeQuestions', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let container: HTMLElement;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: initialContentState,
    });
    dispatch = jest.spyOn(store, 'dispatch');
    services = createTestServices();
    container = assertWindow().document.createElement('div');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders practice questions modal if it is open', () => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesn\'t render practice questions modal if it is closed', () => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(false);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('focus is on pop up content', async() => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener});

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    expect(focus).toHaveBeenCalled();
  });

  it('tracks analytics when clicking x icon', () => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services} >
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>, { createNodeMock: () => container });

    renderer.act(() => {
      const closeButton = component.root.findByProps({ 'data-testid': 'close-practice-questions-popup' });
      closeButton.props.onClick();
    });

    expect(track).toHaveBeenCalled();
  });

  it('tracks analytics when clicking esc', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const element = assertNotNull(node.querySelector('[data-testid=\'practice-questions-popup-wrapper\']'), '');

    element.dispatchEvent(new ((window as any).KeyboardEvent)('keydown', {key: 'Escape'}));

    expect(track).toHaveBeenCalled();
  });

  it('tracks analytics on overlay click', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();
  });

  it('show warning prompt and tracks analytics after confirm', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);
    const spyConfirm = jest.spyOn(assertWindow(), 'confirm')
      .mockImplementation(() => true);

    store.dispatch(nextQuestion());

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(spyConfirm)
      .toHaveBeenCalledWith('Are you sure you want to exit this page? Your progress will not be saved.');
    expect(track).toHaveBeenCalled();
  });

  it('show warning prompt and do not tracks analytics after cancel', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);
    track.mockClear();
    const spyConfirm = jest.spyOn(assertWindow(), 'confirm')
      .mockImplementation(() => false);

    store.dispatch(nextQuestion());

    const { node } = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsPopup />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(spyConfirm)
      .toHaveBeenCalledWith('Are you sure you want to exit this page? Your progress will not be saved.');
    expect(track).not.toHaveBeenCalled();
  });
});
