import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer, { act } from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { renderToDom } from '../../../../test/reactutils';
import { receiveFeatureFlags } from '../../../actions';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import * as appGuards from '../../../guards';
import MessageProvider from '../../../MessageProvider';
import { locationChange } from '../../../navigation/actions';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import HighlightButton from '../../components/Toolbar/HighlightButton';
import { content } from '../../routes';
import { closeMyHighlights, openMyHighlights, receiveHighlights } from '../actions';
import { highlightingFeatureFlag, highlightStyles } from '../constants';
import { highlights, summaryIsLoading } from '../selectors';
import HighlightsPopUp from './HighlightsPopUp';

describe('MyHighlights button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let highlight1: ReturnType<typeof createMockHighlight>;
  let highlight2: ReturnType<typeof createMockHighlight>;

  beforeEach(() => {
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    store.dispatch(receiveFeatureFlags([highlightingFeatureFlag]));

    dispatch = jest.spyOn(store, 'dispatch');
    highlight1 = createMockHighlight('asdf');
    highlight2 = createMockHighlight('lkjh');
  });

  it('opens highlights pop up in "not logged in" state', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightButton />
      </MessageProvider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('closes highlights pop up', async() => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-highlights-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeMyHighlights());
  });

  it('opens highlights pop up in "logged in" state', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightButton />
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => {
      /* fire events that update state */
      component.root.findByType('button').props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openMyHighlights());
  });

  it('focus is on pop up content', async() => {
    const focus = jest.fn();
    const createNodeMock = () => ({focus});

    renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>, {createNodeMock});

    const isHtmlElement = jest.spyOn(appGuards, 'isHtmlElement');

    isHtmlElement.mockReturnValueOnce(true);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(focus).toHaveBeenCalled();
  });

  it('opens highlights pop up with user Highlights', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          note: 'adsf',
          style: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    expect(highlights(store.getState()).length).toBeGreaterThan(0);

    renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp></HighlightsPopUp>
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

  });

  it('shows back to top button on scroll and works on click', async() => {
    let backToTop: HTMLElement | null;

    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          note: 'adsf',
          style: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp></HighlightsPopUp>
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    const target = root.querySelector('[data-testid="show-myhighlights-body"]');

    expect(target).toBeTruthy();

    Object.defineProperty(target, 'height', { value: 1000 });
    Object.defineProperty(target, 'scrollTop', { value: 10, writable: true });

    if (!window || !target) {
      return;
    }

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');
    expect(backToTop).toBeTruthy();

    if (!backToTop) {
      return;
    }

    ReactTestUtils.Simulate.click(backToTop);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');
    expect(backToTop).not.toBeTruthy();
  });

  it('removes scroll listener on unmount', () => {
    let backToTop: HTMLElement | null;

    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          note: 'adsf',
          style: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp></HighlightsPopUp>
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    const target = root.querySelector('[data-testid="show-myhighlights-body"]');

    expect(target).toBeTruthy();

    Object.defineProperty(target, 'height', { value: 1000 });
    Object.defineProperty(target, 'scrollTop', { value: 10, writable: true });

    if (!window || !target) {
      return;
    }

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');
    expect(backToTop).toBeTruthy();

    if (!backToTop) {
      return;
    }

    ReactDOM.unmountComponentAtNode(root);
    ReactTestUtils.Simulate.click(backToTop);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');
    expect(backToTop).not.toBeTruthy();
  });

  it('unmounts without refs', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          note: 'adsf',
          style: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(() => component.unmount()).not.toThrow();
  });

  it('renders loader', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
    });

    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        state: {},
      },
      match: {
        params: {
          book: 'newbook',
          page: 'bar',
        },
        route: content,
      },
    }));

    renderToDom(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp />
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });
    expect(summaryIsLoading(store.getState())).toBe(true);
  });

});
