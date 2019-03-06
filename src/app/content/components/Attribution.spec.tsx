import cloneDeep from 'lodash/fp/cloneDeep';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBookFields } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import MessageProvider from '../../MessageProvider';
import { AppState, Store } from '../../types';
import { initialState } from '../reducer';

describe('Attribution', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  describe('in browser', () => {
    // tslint:disable-next-line:variable-name
    let Attribution: any;
    let state: AppState;
    let store: Store;
    let scrollTo: any;

    beforeEach(() => {
      const mockScrollTo = scrollTo = jest.fn();
      jest.mock('scroll-to-element', () => mockScrollTo);
      Attribution = require('./Attribution').default;

      state = (cloneDeep({
        content: {
          ...initialState,
          book: {
            ...mockCmsBookFields,
            ...book,
          },
          page,
        },
        navigation: { pathname: 'cool path name' },
      }) as any) as AppState;

      store = createStore((s: AppState | undefined) => s || state, state);
    });

    const render = () => <Provider store={store}>
      <MessageProvider>
        <Attribution />
      </MessageProvider>
    </Provider>;

    it('removes listener when it unmounts', () => {
      const { root, node } = renderToDom(render());
      const details = node;

      details.removeEventListener = jest.fn();

      ReactDOM.unmountComponentAtNode(root);

      if (details) {
        expect(details.removeEventListener).toHaveBeenCalled();
      } else {
        expect(details).toBeTruthy();
      }
    });

    it('scrolls to details when toggled', () => {
      const { node } = renderToDom(render());
      const details = node;

      if (!document) {
        return expect(document).toBeTruthy();
      }

      const event = document.createEvent('Event');
      event.initEvent('toggle', true, false);

      details.dispatchEvent(event);

      expect(scrollTo).toHaveBeenCalledWith(details);
    });

    it('mounts and unmounts without a dom', () => {
      const element = renderer.create(render());

      expect(element.unmount).not.toThrow();
    });
  });

  describe('polyfill', () => {
    let loaded: boolean;

    beforeEach(() => {
      loaded = false;

      jest.mock('details-polyfill', () => {
        loaded = true;
      });
    });

    describe('inside browser', () => {
      it('loads', async() => {
        await import('./Attribution');
        expect(loaded).toBe(true);
      });
    });

    describe('outside of browser', () => {
      const documentBack = document;
      const windowBack = window;

      beforeEach(() => {
        delete (global as any).document;
        delete (global as any).window;
      });

      afterEach(() => {
        (global as any).document = documentBack;
        (global as any).window = windowBack;
      });

      it('doesn\'t load', async() => {

        await import('./Attribution');

        expect(loaded).toBe(false);
      });
    });
  });
});
