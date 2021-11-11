import createTestServices from '../../../test/createTestServices';
import { MiddlewareAPI } from '../../types';
import { assertWindow } from '../../utils/browser-assertions';

describe('closeModal', () => {
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./closeModalHook').closeModal;
  let window: Window;

  beforeEach(() => {
    window = assertWindow();
    helpers = {
      ...createTestServices(),
      dispatch: jest.fn(),
      getState: jest.fn(),
      history: {
        goBack: jest.fn(),
        replace: jest.fn(),
      } as any,
    };

    hookFactory = (require('./closeModalHook').closeModal);
  });

  it('replace on closeModal if window history has no state object', () => {
    const hook = hookFactory()(helpers);

    hook();

    expect(helpers.history.replace).toHaveBeenCalled();
    expect(helpers.history.goBack).not.toHaveBeenCalled();

  });

  it('go back on closeModal if window history has a state object', () => {
    jest.spyOn(window, 'history', 'get').mockReturnValue({
      state: {},
    } as any);
    const hook = hookFactory()(helpers);

    hook();

    expect(helpers.history.goBack).toHaveBeenCalled();
    expect(helpers.history.replace).not.toHaveBeenCalled();
  });
});
