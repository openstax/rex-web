import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  const locationBackup = window!.location;
  const serviceWorkerBackup = window!.navigator.serviceWorker;
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  const sw = { update: () => Promise.resolve() };

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, value: { reload: jest.fn() },
    });
    Object.defineProperty(window!.navigator, 'serviceWorker', {
      configurable: true, value: { ready: Promise.resolve(sw) },
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
    const component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    // wait for useEffect()
    await new Promise((resolve) => setImmediate(resolve));
    // wait for the ready Promise
    await new Promise((resolve) => setImmediate(resolve));
    component.root.findByType('button').props.onClick();
    expect(window!.location.reload).toHaveBeenCalled();
  });

  it('doesn\'t render until reload is ready', () => {
    const component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    expect(component.root.findAllByType('button').length).toBe(0);
  });

  it(
    'doesn\'t cause an error if the serviceWorker and/or readyPromise change after rendering',
    async() => {
      let component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      Object.defineProperty(window!.navigator, 'serviceWorker', {
        configurable: true, value: { ready: Promise.resolve(sw) },
      });
      // wait for useEffect()
      await new Promise((resolve) => setImmediate(resolve));
      // wait for the ready Promise
      await new Promise((resolve) => setImmediate(resolve));
      expect(component.root.findAllByType('button').length).toBe(0);

      component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
      // wait for useEffect()
      await new Promise((resolve) => setImmediate(resolve));
      // wait for the ready Promise
      await new Promise((resolve) => setImmediate(resolve));
      component.root.findByType('button').props.onClick();
      expect(window!.location.reload).toHaveBeenCalled();
    }
  );
});
