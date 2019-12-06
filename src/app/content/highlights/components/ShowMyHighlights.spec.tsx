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
import { locationChange } from '../../../navigation/actions';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { content } from '../../routes';
import { receiveHighlights } from '../actions';
import { highlightingFeatureFlag, highlightStyles } from '../constants';
import { summaryIsLoading } from '../selectors';
import HighlightsPopUp from './HighlightsPopUp';
import ShowMyHighlights from './ShowMyHighlights';
import { ShowMyHighlightsBody } from './ShowMyHighlightsStyles';

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

  it('opens highlights pop up with user Highlights', async() => {
    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          annotation: 'adsf',
          color: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightsPopUp/>
      </MessageProvider>
    </Provider>);

    expect(component.root.findByType(ShowMyHighlightsBody)).toBeTruthy();

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

  it('shows back to top button on scroll and works on click', async() => {
    let backToTop: HTMLElement | null;

    act(() => {
      store.dispatch(receiveUser(user));
      store.dispatch(receiveHighlights([
        {
          ...highlight1.serialize().data,
          annotation: 'adsf',
          color: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
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
          ...highlight1.serialize().data,
          annotation: 'adsf',
          color: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
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
          ...highlight1.serialize().data,
          annotation: 'adsf',
          color: highlightStyles[0].label,
        },
        {
          ...highlight2.serialize().data,
        },
      ]));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);

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
        <ShowMyHighlights/>
      </MessageProvider>
    </Provider>);

    expect(summaryIsLoading(store.getState())).toBe(true);
  });

});
