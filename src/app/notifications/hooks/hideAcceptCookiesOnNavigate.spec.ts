import { locationChange } from '../../navigation/actions';
import * as actions from '../actions';
import { AnyNotification } from '../types';
import { hideAcceptCookiesOnNavigateHookBody } from './hideAcceptCookiesOnNavigate';

describe('hideAcceptCookiesOnNavigate', () => {
  const dispatchMock = jest.fn();
  const mock = jest.spyOn(actions, 'dismissNotification');
  const targetNotification: AnyNotification = { type: 'Notification/acceptCookies' };
  const otherNotification: AnyNotification = { type: 'Notification/updateAvailable' };

  const location = { hash: '', pathname: '', search: '', state: {}, };
  const dummyLocationChange = locationChange({location, action: 'PUSH'});

  const helpers: any = (notification: AnyNotification) => ({
    dispatch: dispatchMock,
    getState: () => ({
      notifications: [
        notification,
      ],
    }),
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('when the accept cookies popup is up, finds and dismisses it', async() => {
    await (hideAcceptCookiesOnNavigateHookBody(helpers(targetNotification)))(dummyLocationChange);
    expect(dispatchMock).toHaveBeenCalled();
    expect(mock).toHaveBeenCalledWith(targetNotification);
  });

  it('when the accept cookies popup is NOT up, does nothing', async() => {
    await (hideAcceptCookiesOnNavigateHookBody(helpers(otherNotification)))(dummyLocationChange);
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
