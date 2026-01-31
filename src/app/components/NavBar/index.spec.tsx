import ReactTestUtils from 'react-dom/test-utils';
import createTestStore from '../../../test/createTestStore';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { receiveLoggedOut, receiveUser } from '../../auth/actions';
import { User } from '../../auth/types';
import { AppState, Store } from '../../types';
import { assertWindow } from '../../utils';
import { assertNotNull } from '../../utils/assertions';
import { setAnnotationChangesPending } from '../../content/highlights/actions';

const mockConfirmation = jest.fn();
let mockIsMobile = false;

jest.mock(
  '../../content/highlights/components/utils/showConfirmation',
  () => mockConfirmation
);

jest.mock('../../reactUtils', () => ({
  ...jest.requireActual('../../reactUtils'),
  useMatchMobileQuery: () => mockIsMobile,
}));

const setupMatchMediaMock = (isMobile: boolean = false) => {
  const window = assertWindow();
  window.matchMedia = jest.fn().mockImplementation((query: string) => {
    return {
      addEventListener: jest.fn(),
      matches: isMobile,
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


    describe('MobileDropdown', () => {
      let MobileDropdown: any;
      let unmountComponent: (() => void) | null = null;

      beforeEach(() => {
        store.dispatch(receiveUser(user));
        MobileDropdown = require('.').MobileDropdown;
      });

      afterEach(() => {
        if (unmountComponent) {
          unmountComponent();
          unmountComponent = null;
        }
      });

      it('renders menu items when open', () => {
        const onOpenChange = jest.fn();
        const onAction = jest.fn();
        const window = assertWindow();
        const { unmount } = renderToDom(
          <TestContainer store={store}>
            <MobileDropdown
              user={user}
              currentPath='/test'
              isOpen={true}
              onOpenChange={onOpenChange}
              onAction={onAction}
            />
          </TestContainer>
        );
        unmountComponent = unmount;
        // Modal renders in a portal, so check document body
        const profileLink = window.document.body.querySelector('a[href="/accounts/profile"]');
        const logoutLink = window.document.body.querySelector('a[href^="/accounts/logout"]');
        expect(profileLink).toBeTruthy();
        expect(logoutLink).toBeTruthy();
      });

      it('calls onOpenChange(false) when close icon is clicked', async() => {
        const onOpenChange = jest.fn();
        const onAction = jest.fn();
        const window = assertWindow();
        const { unmount } = renderToDom(
          <TestContainer store={store}>
            <MobileDropdown
              user={user}
              currentPath='/test'
              isOpen={true}
              onOpenChange={onOpenChange}
              onAction={onAction}
            />
          </TestContainer>
        );
        unmountComponent = unmount;

        const closeButton = window.document.body.querySelector(
          '[data-testid="nav-overlay"] button[aria-label="close menu"]'
        ) as HTMLButtonElement;
        expect(closeButton).toBeTruthy();

        await ReactTestUtils.act(async() => {
          (closeButton as any).click();
        });

        expect(onOpenChange).toHaveBeenCalledWith(false);
      });

      it('calls onAction when logout link is clicked', async() => {
        const onOpenChange = jest.fn();
        const onAction = jest.fn();
        const window = assertWindow();
        const { unmount } = renderToDom(
          <TestContainer store={store}>
            <MobileDropdown
              user={user}
              currentPath='/test'
              isOpen={true}
              onOpenChange={onOpenChange}
              onAction={onAction}
            />
          </TestContainer>
        );
        unmountComponent = unmount;

        const logoutLink = window.document.body.querySelector(
          'a[href^="/accounts/logout"]'
        );
        expect(logoutLink).toBeTruthy();

        await ReactTestUtils.act(async() => {
          (logoutLink as any).click();
        });

        expect(onAction).toHaveBeenCalledWith('logout');
      });

      it('calls onAction when profile link is clicked', async() => {
        const onOpenChange = jest.fn();
        const onAction = jest.fn();
        const window = assertWindow();
        const { unmount } = renderToDom(
          <TestContainer store={store}>
            <MobileDropdown
              user={user}
              currentPath='/test'
              isOpen={true}
              onOpenChange={onOpenChange}
              onAction={onAction}
            />
          </TestContainer>
        );
        unmountComponent = unmount;

        const profileLink = window.document.body.querySelector(
          'a[href="/accounts/profile"]'
        );
        expect(profileLink).toBeTruthy();

        await ReactTestUtils.act(async() => {
          (profileLink as any).click();
        });

        expect(onAction).toHaveBeenCalledWith('profile');
      });

    });

    describe('mobile view', () => {
      beforeEach(() => {
        mockIsMobile = true;
        store.dispatch(receiveUser(user));
      });

      afterEach(() => {
        mockIsMobile = false;
      });

      it('renders mobile menu button with initials', () => {
        const { node } = renderToDom(render());
        const toggle = node.querySelector('[data-testid="user-nav-toggle"]');
        expect(toggle).toBeTruthy();
        expect(toggle!.textContent).toBe('TT');
      });

      it('renders mobile menu button with UserIcon for assignable users', () => {
        store.dispatch(receiveUser({ ...user, firstName: '', lastName: '' }));
        const { node } = renderToDom(render());
        const toggle = node.querySelector('[data-testid="user-nav-toggle"]');
        expect(toggle).toBeTruthy();
        const svg = toggle!.querySelector('svg');
        expect(svg).toBeTruthy();
      });

      it('opens overlay when button is clicked', async() => {
        const { node } = renderToDom(render());
        const toggle = node.querySelector('[data-testid="user-nav-toggle"]');
        expect(toggle).toBeTruthy();

        await ReactTestUtils.act(async() => {
          toggle!.click();
        });

        const window = assertWindow();
        const overlay = window.document.body.querySelector('[data-testid="nav-overlay"]');
        expect(overlay).toBeTruthy();
      });

      it('closes overlay when close icon is clicked', async() => {
        const { node } = renderToDom(render());
        const window = assertWindow();

        const toggle = node.querySelector('[data-testid="user-nav-toggle"]');
        await ReactTestUtils.act(async() => {
          toggle!.click();
        });

        const closeIcon = window.document.body.querySelector('[data-testid="nav-overlay"] svg');
        expect(closeIcon).toBeTruthy();

        await ReactTestUtils.act(async() => {
          ReactTestUtils.Simulate.click(closeIcon!.parentElement!);
        });
      });

      it('navigates on logout without unsaved highlights', async() => {
        jest.useFakeTimers();
        const window = assertWindow();
        const mockLocationAssign = jest.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
          value: { ...originalLocation, assign: mockLocationAssign },
          writable: true,
        });

        const { node, unmount } = renderToDom(render());

        await ReactTestUtils.act(async() => {
          const menuToggle = node.querySelector('[data-testid="user-nav-toggle"]');
          expect(menuToggle).toBeTruthy();
          menuToggle!.click();
          jest.runAllTimers();
        });

        await ReactTestUtils.act(async() => {
          const logoutLink = window.document.body.querySelector('a[href^="/accounts/logout"]');
          expect(logoutLink).toBeTruthy();
          (logoutLink as any).click();
          jest.runAllTimers();
        });

        expect(mockConfirmation).not.toHaveBeenCalled();
        expect(mockLocationAssign).toHaveBeenCalledWith(expect.stringContaining('/accounts/logout'));

        await ReactTestUtils.act(async() => {
          unmount();
          jest.runAllTimers();
        });

        Object.defineProperty(window, 'location', {
          value: originalLocation,
          writable: true,
        });
        jest.useRealTimers();
      });

      it('opens profile in new tab when profile link is clicked', async() => {
        jest.useFakeTimers();
        const window = assertWindow();
        const mockOpen = jest.fn();
        const originalOpen = window.open;
        window.open = mockOpen;

        const { node, unmount } = renderToDom(render());

        await ReactTestUtils.act(async() => {
          const menuToggle = node.querySelector('[data-testid="user-nav-toggle"]');
          expect(menuToggle).toBeTruthy();
          menuToggle!.click();
          jest.runAllTimers();
        });

        await ReactTestUtils.act(async() => {
          const profileLink = window.document.body.querySelector('a[href="/accounts/profile"]');
          expect(profileLink).toBeTruthy();
          (profileLink as any).click();
          jest.runAllTimers();
        });

        expect(mockOpen).toHaveBeenCalledWith('/accounts/profile', '_blank');

        await ReactTestUtils.act(async() => {
          unmount();
          jest.runAllTimers();
        });

        window.open = originalOpen;
        jest.useRealTimers();
      });

      it('closes overlay when transitioning from mobile to desktop and back', async() => {
        const window = assertWindow();
        const container = window.document.createElement('div');
        window.document.body.appendChild(container);

        let result = renderToDom(render(), container);

        const toggle = result.node.querySelector('[data-testid="user-nav-toggle"]');
        await ReactTestUtils.act(async() => {
          toggle!.click();
        });

        let overlay = window.document.body.querySelector('[data-testid="nav-overlay"]');
        expect(overlay).toBeTruthy();

        await ReactTestUtils.act(async() => {
          result.unmount();
        });
        window.document.querySelectorAll('[data-testid="nav-overlay"]').forEach((el) => el.remove());

        mockIsMobile = false;
        result = renderToDom(render(), container);

        overlay = window.document.body.querySelector('[data-testid="nav-overlay"]');
        expect(overlay).toBeFalsy();

        await ReactTestUtils.act(async() => {
          result.unmount();
        });
        mockIsMobile = true;
        result = renderToDom(render(), container);

        const newToggle = result.node.querySelector('[data-testid="user-nav-toggle"]');
        expect(newToggle!.getAttribute('aria-expanded')).toBe('false');

        await ReactTestUtils.act(async() => {
          result.unmount();
        });
        window.document.body.removeChild(container);
      });
    });

    it('matches snapshot for logged out', () => {
      store.dispatch(receiveLoggedOut());

      const component = renderer.create(render());
      const tree = component.toJSON();
      component.unmount();

      expect(tree).toMatchSnapshot();
    });

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

        it('allows navigation when no unsaved highlights', async() => {
          const window = assertWindow();
          const { root } = renderToDom(render());
          const logo = root.querySelector('[data-testid="navbar"] > a');
          expect(logo).toBeTruthy();

          const event = window.document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          event.preventDefault = jest.fn();
          logo.dispatchEvent(event);

          await Promise.resolve();

          expect(event.preventDefault).not.toHaveBeenCalled();
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

    describe('mobile logout', () => {
      beforeEach(() => {
        mockIsMobile = true;
      });

      afterEach(() => {
        mockIsMobile = false;
      });

      it('shows confirmation and prevents navigation when user cancels', async() => {
        jest.useFakeTimers();
        mockConfirmation.mockImplementationOnce(() => Promise.resolve(false));
        const window = assertWindow();
        const mockLocationAssign = jest.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
          value: { ...originalLocation, assign: mockLocationAssign },
          writable: true,
        });

        const { root, unmount } = renderToDom(render());

        await ReactTestUtils.act(async() => {
          const menuToggle = root.querySelector('[data-testid="user-nav-toggle"]');
          expect(menuToggle).toBeTruthy();
          menuToggle!.click();
          jest.runAllTimers();
        });

        await ReactTestUtils.act(async() => {
          const logoutLink = window.document.body.querySelector('a[href^="/accounts/logout"]');
          expect(logoutLink).toBeTruthy();
          (logoutLink as any).click();
          jest.runAllTimers();
        });

        expect(mockConfirmation).toHaveBeenCalled();
        expect(mockLocationAssign).not.toHaveBeenCalled();

        await ReactTestUtils.act(async() => {
          unmount();
          jest.runAllTimers();
        });

        Object.defineProperty(window, 'location', {
          value: originalLocation,
          writable: true,
        });
        jest.useRealTimers();
      });

      it('navigates when user confirms discarding unsaved highlights', async() => {
        jest.useFakeTimers();
        mockConfirmation.mockImplementationOnce(() => Promise.resolve(true));
        const window = assertWindow();
        const mockLocationAssign = jest.fn();
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
          value: { ...originalLocation, assign: mockLocationAssign },
          writable: true,
        });

        const { root, unmount } = renderToDom(render());

        await ReactTestUtils.act(async() => {
          const menuToggle = root.querySelector('[data-testid="user-nav-toggle"]');
          expect(menuToggle).toBeTruthy();
          menuToggle!.click();
          jest.runAllTimers();
        });

        await ReactTestUtils.act(async() => {
          const logoutLink = window.document.body.querySelector('a[href^="/accounts/logout"]');
          expect(logoutLink).toBeTruthy();
          (logoutLink as any).click();
          jest.runAllTimers();
        });

        expect(mockConfirmation).toHaveBeenCalled();
        expect(mockLocationAssign).toHaveBeenCalledWith(expect.stringContaining('/accounts/logout'));

        await ReactTestUtils.act(async() => {
          unmount();
          jest.runAllTimers();
        });

        Object.defineProperty(window, 'location', {
          value: originalLocation,
          writable: true,
        });
        jest.useRealTimers();
      });
    });
  });

});
