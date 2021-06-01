import { receiveExperiments } from '../app/featureFlags/actions';
import { Store } from '../app/types';
import { assertDocument, assertWindow } from '../app/utils';
import config from '../config';
import createTestStore from '../test/createTestStore';
import loadOptimize from './loadOptimize';

describe('loadOptimize', () => {
  let store: Store;
  let window: Window;
  let dispatch: jest.SpyInstance;
  const document = assertDocument();

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    dispatch = jest.spyOn(store, 'dispatch');

    const createEvent = document.createEvent.bind(document);
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = jest.fn((type: string) => {
      const element = originalCreateElement(type);
      const event = createEvent('Event');
      event.initEvent('load');
      setImmediate(() => element.onload && element.onload(event));

      return element;
    });
  });

  afterEach(() => {
    document.head.innerHTML = '';
    window.dataLayer = [];
  });

  it('injects correct <script> into head if in production', async() => {
    config.DEPLOYED_ENV = 'openstax.org';
    window.dataLayer.push = jest.fn();

    await loadOptimize(window, store);
    const script = document.head.querySelector('script');

    expect(script!.src).toEqual(
      'https://www.googleoptimize.com/optimize.js?id=OPT-NFHSM4B'
    );
  });

  it('injects correct <script> into head if in development', async() => {
    config.DEPLOYED_ENV = 'foo';
    window.dataLayer.push = jest.fn();

    await loadOptimize(window, store);
    const script = document.head.querySelector('script');

    expect(script!.src).toEqual(
      'https://www.googleoptimize.com/optimize.js?id=OPT-W65B3CP'
    );
  });

  it('registers optimize callback and correctly dispatches action', async() => {
    config.DEPLOYED_ENV = 'foo';
    await loadOptimize(window, store);

    ((window.dataLayer[0] as any)[2] as any).callback('1', 'OCCkMMCZSwW87szzpniCow');
    expect(dispatch).toHaveBeenCalledWith(receiveExperiments(['OCCkMMCZSwW87szzpniCow', '1']));
  });
});
