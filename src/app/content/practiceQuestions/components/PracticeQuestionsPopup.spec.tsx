import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils, { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { dispatchKeyDownEvent, renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import OnEsc from '../../../components/OnEsc';
import * as navigation from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertNotNull, assertWindow } from '../../../utils';
import { content } from '../../routes';
import { captureOpeningElement, clearOpeningElement } from '../../utils/focusManager';
import { closePracticeQuestions, nextQuestion, openPracticeQuestions } from '../actions';
import { modalUrlName } from '../constants';
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
  state: {},
  search: `?modal=${modalUrlName}`,
};

describe('PracticeQuestions', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let container: HTMLElement;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    container = assertWindow().document.createElement('div');
    dispatch = jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearOpeningElement('practicequestions');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders practice questions modal if it is open', () => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesn\'t render practice questions modal if it is closed', () => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(false);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('focus is on close button', (done) => {
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    const document = assertWindow().document;

    const mockButton = document.createElement('button');
    document.body.appendChild(mockButton);
    mockButton.focus();

    captureOpeningElement('practicequestions');

    renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    setTimeout(() => {
      const closeButton = document.querySelector('[data-testid="close-practice-questions-popup"]');
      expect(document.activeElement).toBe(closeButton);
      mockButton.remove();
      done();
    }, 10);
  });

  it('restores focus to opening button when modal closes', (done) => {
    const document = assertWindow().document;

    const mockButton = document.createElement('button');
    document.body.appendChild(mockButton);
    mockButton.focus();

    captureOpeningElement('practicequestions');

    renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    act(() => { store.dispatch(openPracticeQuestions()); });

    // We should be able to blur mockButton and have this still work,
    // but this test is not really working correctly; multiple attempts
    // with Claude could not make it happen.
    setTimeout(() => {
      act(() => { store.dispatch(closePracticeQuestions()); });

      setTimeout(() => {
        expect(document.activeElement).toBe(mockButton);
        mockButton.remove();
        done();
      }, 10);
    }, 10);
  });

  it('does not restore focus when modal closes without opening element', (done) => {
    const document = assertWindow().document;

    const mockButton = document.createElement('button');
    const mockButtonFocus = jest.fn();
    mockButton.focus = mockButtonFocus;
    document.body.appendChild(mockButton);

    renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    act(() => { store.dispatch(openPracticeQuestions()); });

    setTimeout(() => {
      act(() => { store.dispatch(closePracticeQuestions()); });

      setTimeout(() => {
        // When there's no opening element, our focus restoration code should NOT run
        // The mockButton.focus() should never be called by our focus management code
        expect(mockButtonFocus).not.toHaveBeenCalled();
        mockButton.remove();
        done();
      }, 10);
    }, 10);
  });

  it('handles closeButtonRef being called with null', () => {
    // The closeButtonRef callback handles null gracefully (does nothing when element is null)
    // This is tested by closing the modal, which causes the close button to unmount
    // and the ref callback to be called with null
    const document = assertWindow().document;

    renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    act(() => { store.dispatch(openPracticeQuestions()); });

    const closeButton = document.querySelector('[data-testid="close-practice-questions-popup"]');
    expect(closeButton).toBeTruthy();

    // Closing the modal will cause the close button to unmount
    // and the ref callback will be called with null
    // This should not throw
    expect(() => {
      act(() => { store.dispatch(closePracticeQuestions()); });
    }).not.toThrow();
  });

  it('tracks analytics and removes modal-url when clicking x icon', () => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>, { createNodeMock: () => container });

    renderer.act(() => {
      const closeButton = component.root.findByProps({ 'data-testid': 'close-practice-questions-popup' });
      closeButton.props.onClick();
    });

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closePracticeQuestions());
  });

  it('tracks analytics and removes modal-url when pressing esc', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <OnEsc />
      <PracticeQuestionsPopup />
    </TestContainer>);

    const element: HTMLElement = assertNotNull(
      node.querySelector('[data-testid=\'practice-questions-popup-wrapper\']'), ''
    );

    dispatchKeyDownEvent({element, key: 'Escape'});

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closePracticeQuestions());
  });

  it('tracks analytics and removes modal-url on overlay click', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closePracticeQuestions());
  });

  it('show warning prompt and tracks analytics after confirm', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);
    const spyConfirm = jest.spyOn(assertWindow(), 'confirm')
      .mockImplementation(() => true);

    store.dispatch(nextQuestion());

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(spyConfirm)
      .toHaveBeenCalledWith('Are you sure you want to exit this page? Your progress will not be saved.');
    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closePracticeQuestions());
  });

  it('show warning prompt and do not tracks analytics after cancel', async() => {
    const track = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(pqSelectors, 'isPracticeQuestionsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);
    track.mockClear();
    const spyConfirm = jest.spyOn(assertWindow(), 'confirm')
      .mockImplementation(() => false);

    store.dispatch(nextQuestion());

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <PracticeQuestionsPopup />
    </TestContainer>);

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertWindow().document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(spyConfirm)
      .toHaveBeenCalledWith('Are you sure you want to exit this page? Your progress will not be saved.');
    expect(track).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith(closePracticeQuestions());
  });
});
