import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { retiredBookRedirect } from '../actions';
import { addQueryNotifications } from './addQueryNotification';

describe('addQueryNotification', () => {

  it('dispatches notification if provided', async() => {
    const services = {
      ...createTestServices(),
      ...createTestStore({
        navigation: {
          hash: '',
          pathname: '',
          query: { message: 'retired', },
          search: '',
          state: null,
        },
      }),
    };
    const dispatchSpy = jest.spyOn(services, 'dispatch');

    addQueryNotifications(services);
    await Promise.resolve();

    expect(dispatchSpy).toHaveBeenCalledWith(retiredBookRedirect());
  });

  it('no error if notification not provided', async() => {
    const services = {
      ...createTestServices(),
      ...createTestStore(),
    };
    const dispatchSpy = jest.spyOn(services, 'dispatch');

    addQueryNotifications(services);
    await Promise.resolve();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
