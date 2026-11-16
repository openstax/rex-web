import { assertWindow } from './browser-assertions';
import { removeQueryParams } from './removeQueryParams';

describe('removeQueryParams', () => {
  let replaceStateSpy: jest.Mock;

  const setLocation = (search: string, hash = '') => {
    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {...assertWindow().location, search, hash},
    });
  };

  beforeEach(() => {
    replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {writable: true, value: replaceStateSpy});
  });

  it('removes the given params, keeping other params and the hash', () => {
    setLocation('?t=token&auth=other-token&other=thing', '#term-12');
    removeQueryParams(assertWindow(), ['t', 'auth']);
    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname + '?other=thing#term-12'
    );
  });

  it('removes the query string when nothing else is left', () => {
    setLocation('?auth=token');
    removeQueryParams(assertWindow(), ['auth']);
    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname
    );
  });

  it('leaves the url alone when none of the params are there', () => {
    setLocation('?other=thing');
    removeQueryParams(assertWindow(), ['auth']);
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
