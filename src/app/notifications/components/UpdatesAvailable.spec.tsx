import { ReactTestRenderer } from 'react-test-renderer';
import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  const locationBackup = window!.location;
  const serviceWorkerBackup = window!.navigator.serviceWorker;
  let React: ReturnType<typeof reactAndFriends>['React'];
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer'];
  let UpdatesAvailable = require('./UpdatesAvailable').default;
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
    UpdatesAvailable = require('./UpdatesAvailable').default;
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
    // resolve the readyPromise
    renderer.act(() => resolveReadyPromise(sw));
    // wait for the component to re-render
    await renderer.act(async() => {
      await new Promise((resolve) => setImmediate(resolve));
    });
    component!.root.findByType('button').props.onClick();
    expect(window!.location.reload).toHaveBeenCalled();
  });

  it('doesn\'t render until the serviceWorker is ready', async() => {
    let component: ReactTestRenderer;
    // wait for useEffect()
    renderer.act(() => {
      component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    });
    // wait for the component to re-render
    await renderer.act(async() => {
      await new Promise((resolve) => setImmediate(resolve));
    });
    expect(component!.root.findAllByType('button').length).toBe(0);
  });

  it('renders immediately if the browser does not support serviceWorkers', async() => {
    Object.defineProperty(window!.navigator, 'serviceWorker', {
      configurable: true, value: undefined,
    });

    let component: ReactTestRenderer;
    // wait for useEffect()
    renderer.act(() => {
      component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    });
    // wait for the component to re-render
    await renderer.act(async() => {
      await new Promise((resolve) => setImmediate(resolve));
    });
    expect(component!.root.findAllByType('button').length).toBe(1);
  });

  it('doesn\'t render if the serviceWorker or readyPromise change after render(),\
      then the old readyPromise is resolved', async() => {
      let component: ReactTestRenderer;

      // wait for useEffect()
      await renderer.act(async() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);

        // wait for the component to render
        await new Promise((resolve) => setImmediate(resolve));

        // replace the readyPromise before useEffect()
        Object.defineProperty(window!.navigator, 'serviceWorker', {
          configurable: true, value: {
            ready: Promise.resolve(sw),
          },
        });
      });

      // resolve the readyPromise
      renderer.act(() => resolveReadyPromise(sw));
      // wait for the component to re-render
      await renderer.act(async() => {
        await new Promise((resolve) => setImmediate(resolve));
      });
      expect(component!.root.findAllByType('button').length).toBe(0);

      renderer.act(() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      });
      // wait for the component to render
      await renderer.act(async() => {
        await new Promise((resolve) => setImmediate(resolve));
      });
      expect(component!.root.findAllByType('button').length).toBe(1);
    }
  );

  it('doesn\'t render if the serviceWorker or readyPromise change after useEffect(),\
      then the old readyPromise is resolved', async() => {
      let component: ReactTestRenderer;

      // wait for useEffect()
      renderer.act(() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      });
      // replace the readyPromise after useEffect()
      Object.defineProperty(window!.navigator, 'serviceWorker', {
        configurable: true, value: { ready: Promise.resolve(sw) },
      });
      // resolve the readyPromise
      renderer.act(() => resolveReadyPromise(sw));
      // wait for the component to re-render
      await renderer.act(async() => {
        await new Promise((resolve) => setImmediate(resolve));
      });
      expect(component!.root.findAllByType('button').length).toBe(0);

      renderer.act(() => {
        component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      });
      // wait for the component to render
      await renderer.act(async() => {
        await new Promise((resolve) => setImmediate(resolve));
      });
      expect(component!.root.findAllByType('button').length).toBe(1);
    }
  );
});
