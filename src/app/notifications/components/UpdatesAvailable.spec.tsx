import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  const reloadBackup = window!.location.reload;
  const serviceWorkerBackup = window!.navigator.serviceWorker;
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  let reload: jest.SpyInstance;
  const sw = { update: () => Promise.resolve() };

  beforeEach(() => {
    reload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload },
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
      value: { reload: reloadBackup },
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
    expect(reload).toHaveBeenCalled();
  });

  it('doesn\'t render until reload is ready', () => {
    const component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    expect(component.root.findAllByType('button').length).toBe(0);
  });
});
