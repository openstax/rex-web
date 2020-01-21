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
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { loadMoreSummaryHighlights, openMyHighlights, receiveHighlights } from '../actions';
import { highlightingFeatureFlag, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import HighlightsPopUp from './HighlightsPopUp';
import ShowMyHighlights from './ShowMyHighlights';
import { HighlightContentWrapper, ShowMyHighlightsBody } from './ShowMyHighlightsStyles';

describe('Show my highlights', () => {
  let store: Store;
  let user: User;
  let highlight1: ReturnType<typeof createMockHighlight>;
  let highlight2: ReturnType<typeof createMockHighlight>;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'some_uuid'};

    store.dispatch(receiveFeatureFlags([highlightingFeatureFlag]));

    highlight1 = createMockHighlight('asdf');
    highlight2 = createMockHighlight('lkjh');
    window = assertWindow();
  });

  it('renders through pop up with user Highlights', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          annotation: 'asdf',
          color: highlightStyles[0].label,
          id: highlight1.id,
        },
        {
          id: highlight2.id,
        },
      ] as HighlightData[]));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp/>
      </MessageProvider>
    </Provider>);

    act(() => { store.dispatch(openMyHighlights()); });

    expect(component.root.findByType(ShowMyHighlightsBody)).toBeTruthy();

  });

  it('doesn\'t throw when rendering with bad color', async() => {
    expect(() => renderer.create(
      <HighlightContentWrapper color='asdfasdfasdf' />
    )).not.toThrow();
  });

  it('does not render show my highlights without highlights', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([]));
    });

    const render = () => {
      renderer.create(<Provider store={store}>
        <MessageProvider>
          <ShowMyHighlights/>
        </MessageProvider>
      </Provider>);
    };

    expect(() => render()).not.toThrow();
  });

  it('doesn\'t request more if not at bottom', () => {
    const dispatch = spyOn(store, 'dispatch');

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);
    const target = root.querySelector('[data-testid="show-myhighlights-body"]');
    if (!target) {
      return expect(target).toBeTruthy();
    }
    Object.defineProperty(target, 'scrollHeight', { value: 1000 });
    Object.defineProperty(target, 'offsetHeight', { value: 100 });
    Object.defineProperty(target, 'scrollTop', { value: 100 });

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    target.dispatchEvent(scrollEvent);

    expect(dispatch).not.toHaveBeenCalledWith(loadMoreSummaryHighlights());
  });

  it('requests more highlights when scrolling down', () => {
    const dispatch = spyOn(store, 'dispatch');

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);
    const target = root.querySelector('[data-testid="show-myhighlights-body"]');
    if (!target) {
      return expect(target).toBeTruthy();
    }
    Object.defineProperty(target, 'scrollHeight', { value: 1000 });
    Object.defineProperty(target, 'offsetHeight', { value: 100 });
    Object.defineProperty(target, 'scrollTop', { value: 900 });

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    target.dispatchEvent(scrollEvent);

    expect(dispatch).toHaveBeenCalledWith(loadMoreSummaryHighlights());
  });

  it('shows back to top button on scroll and works on click', async() => {
    let backToTop: HTMLElement | null;

    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          annotation: 'asdf',
          color: highlightStyles[0].label,
          id: highlight1.id,
        },
        {
          id: highlight2.id,
        },
      ] as HighlightData[]));
    });

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);

    const target = root.querySelector('[data-testid="show-myhighlights-body"]');

    expect(target).toBeTruthy();

    Object.defineProperty(target, 'height', { value: 1000 });
    Object.defineProperty(target, 'scrollTop', { value: 10, writable: true });

    if (!target) {
      return expect(target).toBeTruthy();
    }

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');

    if (!backToTop) {
      return expect(backToTop).toBeTruthy();
    }

    ReactTestUtils.Simulate.click(backToTop);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');
    expect(backToTop).not.toBeTruthy();
  });

  it('does not scroll to top without ref', () => {
    let backToTop: HTMLElement | null;

    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          annotation: 'asdf',
          color: highlightStyles[0].label,
          id: highlight1.id,
        },
        {
          id: highlight2.id,
        },
      ] as HighlightData[]));
    });

    const {root} = renderToDom(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);

    const target = root.querySelector('[data-testid="show-myhighlights-body"]');

    expect(target).toBeTruthy();

    Object.defineProperty(target, 'height', { value: 1000 });
    Object.defineProperty(target, 'scrollTop', { value: 10, writable: true });

    if (!target) {
      return expect(target).toBeTruthy();
    }

    const scrollEvent = window.document.createEvent('UIEvents');
    scrollEvent.initEvent('scroll', true, false);
    renderer.act(() => {
      target.dispatchEvent(scrollEvent);
    });

    backToTop = root.querySelector('[data-testid="back-to-top-highlights"]');

    if (!backToTop) {
      return expect(backToTop).toBeTruthy();
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
          annotation: 'asdf',
          color: highlightStyles[0].label,
          id: highlight1.id,
        },
        {
          id: highlight2.id,
        },
      ] as HighlightData[]));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);

    expect(() => component.unmount()).not.toThrow();
  });
});
