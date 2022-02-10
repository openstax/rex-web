import createTestServices from '../../../test/createTestServices';
import { MiddlewareAPI } from '../../types';

describe('closeModal', () => {
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./closeModalHook').closeModal;

  beforeEach(() => {
    helpers = {
      ...createTestServices(),
      dispatch: jest.fn(),
      getState: jest.fn(),
      history: {
        goBack: jest.fn(),
        location: {},
        replace: jest.fn(),
      } as any,
    };

    hookFactory = (require('./closeModalHook').closeModal);
  });

  it('replace on closeModal if history.location.state undefined', () => {
    const hook = hookFactory(helpers);

    hook();

    expect(helpers.history.replace).toHaveBeenCalled();
    expect(helpers.history.goBack).not.toHaveBeenCalled();

  });

  it('go back on closeModal if history.location.state defined', () => {
    helpers.history.location.state = {};
    const hook = hookFactory(helpers);

    hook();

    expect(helpers.history.goBack).toHaveBeenCalled();
    expect(helpers.history.replace).not.toHaveBeenCalled();
  });
});
