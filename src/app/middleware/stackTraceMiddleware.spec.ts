import { MiddlewareAPI } from '../types';
import stackTraceMiddleware from './stackTraceMiddleware';

const mockStackTrace = ['unused', 'parts', 'mock', 'stack', 'trace'];
jest.mock('stacktrace-js', () => ({
  get: () => new Promise((resolve) => resolve(mockStackTrace)),
}));

describe('stackTraceMiddleware', () => {

  it('adds trace to actions', async() => {
    const next = jest.fn();
    const middlewareApi = {} as MiddlewareAPI;
    const middleware = stackTraceMiddleware(middlewareApi)(next);
    const action = {type: 'type', payload: {}};

    await middleware({...action});

    expect(next).toHaveBeenCalledWith({
      ...action,
      trace: ['mock', 'stack', 'trace'],
    });
  });
});
