import React from 'react';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as Services from '../../../context/Services';
import * as appGuards from '../../../guards';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { closeMyHighlights, openMyHighlights } from '../actions';
import HighlightsPopUp from './HighlightsPopUp';

describe('MyHighlights button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('opens pop up in "not logged in" state', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('closes pop up', async() => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-highlights-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeMyHighlights());
  });

  it('opens pop up in "logged in" state', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
    });

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightButton />
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('focus is on pop up content', async() => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener});

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(focus).toHaveBeenCalled();
  });

  it('handles event listeners on mount and unmount for onEsc util', () => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(addEventListener).toHaveBeenCalled();

    component.unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });

  it('handles event listeners on component update for onEsc util', () => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    renderer.create(<Provider store={{...store, }}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValue(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(addEventListener).toHaveBeenCalled();

    // Force componentDidUpdate()
    act(() => { store.dispatch(receiveUser(user)); });

    expect(removeEventListener).toHaveBeenCalled();
  });

  it('else path for component will unmount', () => {
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<Provider store={{...store, }}>
      <Services.Provider value={services}>
        <MessageProvider>
          <HighlightsPopUp />
        </MessageProvider>
      </Services.Provider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValue(false);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(addEventListener).not.toHaveBeenCalled();

    component.unmount();

    expect(removeEventListener).not.toHaveBeenCalled();
  });
});
