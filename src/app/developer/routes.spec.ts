import { routes } from './routes';

describe('developer route', () => {
  it('makes a url', () => {
    expect(routes.getUrl()).toEqual(routes.paths[0]);
  });
});
