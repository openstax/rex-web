import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import * as helpers from './applicationUpdates';
import Sentry from './Sentry';

describe('serviceWorkerNeedsUpdate', () => {
  it('says no if there isnt one', () => {
    expect(helpers.serviceWorkerNeedsUpdate(undefined)).toBe(false);
  });

  it('says no if there is already one waiting', () => {
    const sw = {waiting: {}} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(false);
  });

  it('says no if there is already one installed', () => {
    const sw = {installing: {}} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(false);
  });

  it('says yes', () => {
    const sw = {} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(true);
  });
});

describe('findAndInstallServiceWorkerUpdate', () => {
  it('noops if no update is needed', () => {
    const cb = jest.fn();
    const sw = {waiting: {}, update: jest.fn() as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;
    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    expect(cb).toHaveBeenCalled();
    expect(sw.update).not.toHaveBeenCalled();
  });

  it('handles update error', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const sw = {update: update as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;
    const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => null);

    let failUpdate: (e: Error) => void = () => null;
    update.mockReturnValue(new Promise((_resolve, reject) => failUpdate = reject));

    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    const error = new Error('asdfasdf');
    failUpdate(error);

    await Promise.resolve();

    expect(cb).toHaveBeenCalled();
    expect(sw.update).toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledWith(error);
  });

  it('after update, if not installing, callback immediately', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const sw = {update: update as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;

    let finishUpdate: () => void = () => null;
    update.mockReturnValue(new Promise((resolve) => finishUpdate = resolve));

    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    finishUpdate();

    await Promise.resolve();

    expect(cb).toHaveBeenCalled();
    expect(sw.update).toHaveBeenCalled();
  });

  it('after update, if installing, waits for installed', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const serviceWorker = {
      addEventListener: addEventListener as ServiceWorker['addEventListener'],
      removeEventListener: removeEventListener as ServiceWorker['removeEventListener'],
      state: 'installing',
    };
    const sw = {
      installing: undefined as typeof serviceWorker | undefined,
      update: update as ServiceWorkerRegistration['update'],
    };

    let finishUpdate: () => void = () => null;
    update.mockReturnValue(new Promise((resolve) => finishUpdate = resolve));

    let stateChangeHandler: () => void = () => null;
    addEventListener.mockImplementation((_event, handler) => stateChangeHandler = handler);

    helpers.findAndInstallServiceWorkerUpdate(sw as ServiceWorkerRegistration, cb);

    expect(sw.update).toHaveBeenCalled();

    sw.installing = serviceWorker;
    finishUpdate();
    await Promise.resolve();

    expect(addEventListener).toHaveBeenCalledWith('statechange', expect.anything());

    stateChangeHandler();

    expect(cb).not.toHaveBeenCalled();

    serviceWorker.state = 'installed';
    stateChangeHandler();

    expect(cb).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledWith('statechange', stateChangeHandler);
  });
});
