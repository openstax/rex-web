import createTestServices from '../../../test/createTestServices';
import { MiddlewareAPI } from '../../types';

describe('closeModal', () => {
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./closeModalHook').closeModal;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    helpers = {
      ...createTestServices(),
      dispatch: jest.fn(),
      getState: jest.fn(),
      history: {
        goBack: jest.fn(),
      } as any,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hookFactory = (require('./closeModalHook').closeModal);
  });

  it('go back on closeModal', () => {
    const hook = hookFactory(helpers);

    hook();

    expect(helpers.history.goBack).toHaveBeenCalled();
  });
});
