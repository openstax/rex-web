import { locationChange } from '../../navigation/actions';
import * as actions from '../actions';
import { hideAcceptCookiesOnNavigateHookBody } from './hideAcceptCookiesOnNavigate';

declare const window: Window;

describe('hideAcceptCookiesOnNavigate', () => {
  const dispatchMock = jest.fn();
  const mock = jest.spyOn(actions, 'dismissNotification');
  const targetNotification = { type: 'Notification/acceptCookies' };
  const otherNotification = { type: 'Notification/somethingElse' };
  const helpers = (notification) => ({
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
    await (hideAcceptCookiesOnNavigateHookBody(helpers(targetNotification)))(locationChange());
    expect(dispatchMock).toHaveBeenCalled();
    expect(mock).toHaveBeenCalledWith(targetNotification);
  });

  it('when the accept cookies popup is NOT up, does nothing', async() => {
    await (hideAcceptCookiesOnNavigateHookBody(helpers(otherNotification)))(locationChange());
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
