import createTestStore from '../../../test/createTestStore';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { receiveLoggedOut, receiveUser } from '../../auth/actions';
import { User } from '../../auth/types';
import { AppState, Store } from '../../types';
import { assertWindow } from '../../utils';
import { assertNotNull } from '../../utils/assertions';
import { setAnnotationChangesPending } from '../../content/highlights/actions';

const mockConfirmation = jest.fn();

jest.mock(
  '../../content/highlights/components/utils/showConfirmation',
  () => mockConfirmation
);

const setupMatchMediaMock = () => {
  const window = assertWindow();
  window.matchMedia = jest.fn().mockImplementation((query: string) => {
    return {
      addEventListener: jest.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: jest.fn(),
    };
  });
};

// Fix ResizeObserver mock for react-aria compatibility
const setupResizeObserverMock = () => {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

describe('content', () => {
  let React: ReturnType<typeof reactAndFriends>['React'];
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer'];

  beforeEach(() => {
    resetModules();
    jest.resetAllMocks();
    setupMatchMediaMock();
    setupResizeObserverMock();
    ({ React, renderer, renderToDom, TestContainer } = reactAndFriends());
  });

  describe('in browser', () => {
    let NavBar: any;
    let store: Store;
    let user: User;

    beforeEach(() => {
      user = { firstName: 'test', isNotGdprLocation: true, lastName: 'test', uuid: 'some_uuid' };
      store = createTestStore();
      NavBar = require('.').default;
    });

    const render = () => <TestContainer store={store}>
      <NavBar />
    </TestContainer>;

    it('matches snapshot for null state', () => {
      const component = renderer.create(render());
      const tree = component.toJSON();
      component.unmount();

      expect(tree).toMatchSnapshot();
    });

    describe('when logged in', () => {
      beforeEach(() => {
        store.dispatch(receiveUser(user));
      });

      it('matches snapshot', () => {
        const component = renderer.create(render());
        const tree = component.toJSON();
        component.unmount();

        expect(tree).toMatchSnapshot();
      });

      // Note: Account links are now inside ProfileMenu's popover on desktop
      // The popover uses RAC which handles events properly
    });

    describe('assignable user', () => {
      beforeEach(() => {
        // Assignable students do not have first and last names
        store.dispatch(receiveUser({ ...user, firstName: '', lastName: '' }));
      });

      it('renders', () => {
        const component = renderer.create(render());
        const tree = component.toJSON();
        component.unmount();

        expect(tree).toMatchSnapshot();
      });
    });

    it('matches snapshot for logged out', () => {
      store.dispatch(receiveLoggedOut());

      const component = renderer.create(render());
      const tree = component.toJSON();
      component.unmount();

      expect(tree).toMatchSnapshot();
    });

    // Note: Scroll blocking is now handled by RAC Modal internally

    describe('logo href', () => {
      describe('default', () => {
        beforeEach(() => {
          const state = {
            navigation: { pathname: '/anything/' },
          } as unknown as AppState;
          store = createTestStore(state);
        });

        it('correctly sets href on icon', () => {
          const { node } = renderToDom(render());
          const anchor = assertNotNull(node.querySelector('[data-testid=\'navbar\'] > a'), '');
          expect(anchor.href).toMatch(/^https?:\/\/[^/]+\/$/);
        });
      });

      describe('portal', () => {
        const portalName = 'portalName';

        beforeEach(() => {
          const params = { portalName };
          const state = {
            navigation: {
              match: { params },
            },
          } as unknown as AppState;
          store = createTestStore(state);
        });

        it('correctly sets href on icon', () => {
          const { node } = renderToDom(render());
          const anchor = assertNotNull(node.querySelector('[data-testid=\'navbar\'] > a'), '');
          expect(anchor.href).toMatch(new RegExp(`^https?://[^/]+/${portalName}/$`));
        });
      });
    });
  });

  describe('polyfill', () => {
    let loaded: boolean;

    beforeEach(() => {
      loaded = false;

      jest.doMock('focus-within-polyfill', () => {
        loaded = true;
      });
    });

    describe('inside browser', () => {
      it('loads', async() => {
        require('.');
        await Promise.resolve();
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
        require('.');
        await Promise.resolve();
        expect(loaded).toBe(false);
      });
    });
  });

  describe('with unsaved highlights', () => {
    let NavBar: any;
    let store: Store;
    let user: User;

    beforeEach(() => {
      user = { firstName: 'testUnsaved', isNotGdprLocation: true, lastName: 'test', uuid: 'some_uuid' };
      store = createTestStore();
      store.dispatch(receiveUser(user));
      store.dispatch(setAnnotationChangesPending(true));
      NavBar = require('.').default;
    });

    const render = () => <TestContainer store={store}>
      <NavBar />
    </TestContainer>;

    it('shows confirmation and prevents navigation on logo click if unsaved highlights exist', async() => {
      mockConfirmation.mockImplementationOnce(() => Promise.resolve(false));
      const window = assertWindow();
      const { root } = renderToDom(render());
      const logo = root.querySelector('[data-testid="navbar"] > a');
      expect(logo).toBeTruthy();

      const event = window.document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      event.preventDefault = jest.fn();
      logo!.dispatchEvent(event);

      await Promise.resolve();

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('navigates if user confirms discarding unsaved highlights (logo)', async() => {
      mockConfirmation.mockImplementationOnce(() => Promise.resolve(true));
      const window = assertWindow();

      const { root } = renderToDom(render());
      const logo = root.querySelector('[data-testid="navbar"] > a');
      expect(logo).toBeTruthy();

      const event = window.document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      event.preventDefault = jest.fn();

      logo!.dispatchEvent(event);

      await Promise.resolve();

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});
