import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import * as helpers from './applicationUpdates';

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
});
