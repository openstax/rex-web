import createTestServices from '../../../test/createTestServices';
import { reactAndFriends, resetModules } from '../../../test/utils';
import * as Services from '../../context/Services';

describe('UpdatesAvailable', () => {
  const reloadBackup = window!.location.reload;
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let MessageProvider: ReturnType<typeof reactAndFriends>['MessageProvider']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  let serviceWorkerNeedsUpdate: jest.SpyInstance;
  let reload: jest.SpyInstance;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    reload = window!.location.reload = jest.fn();
    resetModules();
    ({React, renderer, MessageProvider} = reactAndFriends());
    UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
    serviceWorkerNeedsUpdate = jest.spyOn(require('../../../helpers/applicationUpdates'), 'serviceWorkerNeedsUpdate');
    services = createTestServices();
  });

  afterEach(() => {
    window!.location.reload = reloadBackup;
  });

  it('reloads on click', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <UpdatesAvailable />
      </MessageProvider>
    </Services.Provider>);
    component.root.findByType('button').props.onClick();
    expect(reload).toHaveBeenCalled();
  });

  it('doesn\'t render until reload is ready', () => {
    serviceWorkerNeedsUpdate.mockReturnValue(true);
    const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
    expect(component.root.findAllByType('button').length).toBe(0);
  });
});
