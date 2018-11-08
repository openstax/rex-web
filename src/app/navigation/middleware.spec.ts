import { createMemoryHistory } from 'history';
import * as actions from './actions';

const routes = [
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'test1',
    paths: ['/test1'],
  },
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'test2',
    paths: ['/test2'],
  },
];

describe('navigation middleware', () => {
  let middleware = require('./middleware');

  beforeEach(() => {
    middleware = require('./middleware').default;
  });

  it('calls history when callHistoryMethod is dispatched', () => {
    const history = createMemoryHistory();
    const next = jest.fn((_: AnyAction) => undefined);
    const dispatch = jest.fn((_: AnyAction) => undefined);

    const pushSpy = jest.spyOn(history, 'push');
    pushSpy.mockImplementation(() => null);

    middleware([], history)({dispatch})(next)(actions.callHistoryMethod({method: 'push', url: 'someplace'}));

    expect(pushSpy).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches locationChange when history updates externally', () => {
    const history = createMemoryHistory();
    const dispatch = jest.fn((_: AnyAction) => undefined);

    middleware([], history)({dispatch});

    history.push('/foobar');

    expect(dispatch).toHaveBeenCalledWith(actions.locationChange({location: history.location}));
  });

  it('dispatches locationChange with matching route', () => {
    const history = createMemoryHistory();
    const dispatch = jest.fn((_: AnyAction) => undefined);

    middleware(routes, history)({dispatch});

    history.push('/test2');

    expect(dispatch).toHaveBeenCalledWith(actions.locationChange({
      location: history.location,
      match: {route: routes[1], params: {}},
    }));
  });
});
