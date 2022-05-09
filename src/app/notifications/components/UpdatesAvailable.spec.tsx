import { ReactTestRenderer } from 'react-test-renderer';
import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  const locationBackup = window!.location;
  const serviceWorkerBackup = window!.navigator.serviceWorker;
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  const sw = { update: () => Promise.resolve() };
  let resolveReadyPromise: (sw: { update: () => Promise<void> }) => void;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, value: { reload: jest.fn() },
    });
    Object.defineProperty(window!.navigator, 'serviceWorker', {
      configurable: true, value: { ready: new Promise((resolve) => resolveReadyPromise = resolve) },
    });
    resetModules();
    ({React, renderer, TestContainer} = reactAndFriends());
    UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, value: locationBackup,
    });
    Object.defineProperty(window!.navigator, 'serviceWorker', {
      configurable: true, value: serviceWorkerBackup,
    });
  });

  it('reloads on click', async() => {
    let component: ReactTestRenderer;
    // wait for useEffect()
    renderer.act(() => {
      component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    });
    // resolve and wait for the readyPromise
    renderer.act(() => resolveReadyPromise(sw));
    await window!.navigator.serviceWorker.ready;
    // wait for the component to re-render
    await new Promise((resolve) => setImmediate(resolve));
    component!.root.findByType('button').props.onClick();
    expect(window!.location.reload).toHaveBeenCalled();
  });

  it('doesn\'t render until reload is ready', async() => {
    let component: ReactTestRenderer;
    // wait for useEffect()
    renderer.act(() => {
      component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    });
    // can't really wait for the readyPromise here since it's never resolved
    // so we just wait for another resolved Promise instead
    await Promise.resolve(sw);
    // wait for the component to re-render
    await new Promise((resolve) => setImmediate(resolve));
    expect(component!.root.findAllByType('button').length).toBe(0);
  });

  it(
    'doesn\'t cause an error if the serviceWorker and/or readyPromise change after rendering',
    async() => {
      let component: ReactTestRenderer;

      // wait for useEffect()
      renderer.act(() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      });
      // replace the readyPromise so the old one will never get resolved
      Object.defineProperty(window!.navigator, 'serviceWorker', {
        configurable: true, value: { ready: new Promise((resolve) => resolveReadyPromise = resolve) },
      });
      // resolve and wait for the readyPromise
      renderer.act(() => resolveReadyPromise(sw));
      await window!.navigator.serviceWorker.ready;
      // wait for the component to re-render
      await new Promise((resolve) => setImmediate(resolve));
      expect(component!.root.findAllByType('button').length).toBe(0);

      renderer.act(() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      });
      // wait for the readyPromise (already resolved)
      await window!.navigator.serviceWorker.ready;
      // wait for the component to render
      await new Promise((resolve) => setImmediate(resolve));
      expect(component!.root.findAllByType('button').length).toBe(1);
    }
  );
});
