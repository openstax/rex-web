import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { dispatchKeyDownEvent, renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import * as navigation from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDocument, assertNotNull } from '../../../utils';
import { content } from '../../routes';
import { closeKeyboardShortcutsMenu, openKeyboardShortcutsMenu } from '../actions';
import * as ksSelectors from '../selectors';
import KeyboardShortcutsPopup from './KeyboardShortcutsPopup';

// hack copied from practiceQuestions popup spec
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
};

describe('KeyboardShortcuts', () => {
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
    container = assertDocument().createElement('div');
    dispatch = jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders keyboard shortcuts modal if it is open', () => {
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(true);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesn\'t render keyboard shortcuts modal if it is closed', () => {
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(false);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>, { createNodeMock: () => container });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('focus is on pop up content', async() => {
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(true);
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener});

    renderer.create(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>, {createNodeMock});

    expect(focus).toHaveBeenCalled();
  });

  it('tracks analytics and adds modal-url when clicking shift + ?', async() => {
    const track = jest.spyOn(services.analytics.openCloseKeyboardShortcuts, 'track');
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(false);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>);
    expect(node).toBeNull();

    expect(track).not.toHaveBeenCalled();

    dispatchKeyDownEvent({key: '?', shiftKey: true});

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(openKeyboardShortcutsMenu());
  });

  it('does not interfere with text entry', async() => {
    const track = jest.spyOn(services.analytics.openCloseKeyboardShortcuts, 'track');
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(false);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
      <input type='search'/>
    </TestContainer>);

    dispatchKeyDownEvent({key: '?', shiftKey: true, target: node});

    expect(track).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('tracks analytics and removes modal-url when clicking x icon', () => {
    const track = jest.spyOn(services.analytics.openCloseKeyboardShortcuts, 'track');
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const component = renderer.create(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>, { createNodeMock: () => container });

    expect(track).not.toHaveBeenCalled();

    renderer.act(() => {
      const closeButton = component.root.findByProps({ 'data-testid': 'close-keyboard-shortcuts-popup' });
      closeButton.props.onClick();
    });

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closeKeyboardShortcutsMenu());
  });

  it('tracks analytics and removes modal-url when clicking esc', async() => {
    const track = jest.spyOn(services.analytics.openCloseKeyboardShortcuts, 'track');
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>);

    expect(track).not.toHaveBeenCalled();

    const element: HTMLElement = assertNotNull(
      node.querySelector('[data-testid=\'keyboard-shortcuts-popup-wrapper\']'), ''
    );

    dispatchKeyDownEvent({element, key: 'Escape'});

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closeKeyboardShortcutsMenu());
  });

  it('tracks analytics and removes modal-url on overlay click', async() => {
    const track = jest.spyOn(services.analytics.openCloseKeyboardShortcuts, 'track');
    jest.spyOn(ksSelectors, 'isKeyboardShortcutsOpen').mockReturnValue(true);
    jest.spyOn(navigation, 'match').mockReturnValue(mockMatch);

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <KeyboardShortcutsPopup />
    </TestContainer>);

    expect(track).not.toHaveBeenCalled();

    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = assertDocument().createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(closeKeyboardShortcutsMenu());
  });
});
