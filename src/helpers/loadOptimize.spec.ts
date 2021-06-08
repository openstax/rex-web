import { receiveExperiments } from '../app/featureFlags/actions';
import { Store } from '../app/types';
import { assertDocument, assertWindow } from '../app/utils';
import config from '../config';
import createTestStore from '../test/createTestStore';
import loadOptimize, { getCallback } from './loadOptimize';

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
  });

  it('injects correct <script> into head if in production', async() => {
    config.DEPLOYED_ENV = 'openstax.org';
    window.dataLayer.push = jest.fn();
    window.gtag = jest.fn();

    const mockAppend = jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
    await loadOptimize(window, store);

    expect(mockAppend.mock.calls[0][0]).toMatchInlineSnapshot(`
    <script
      src="https://www.googleoptimize.com/optimize.js?id=OPT-NFHSM4B"
      type="text/javascript"
    />
  `);

  });

  it('injects correct <script> into head if in development', async() => {
    config.DEPLOYED_ENV = 'foo';
    window.dataLayer.push = jest.fn();
    window.gtag = jest.fn();

    const mockAppend = jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
    await loadOptimize(window, store);

    // const script = document.head.querySelector('script');
    expect(mockAppend.mock.calls[1][0]).toMatchInlineSnapshot(`
    <script
      src="https://www.googleoptimize.com/optimize.js?id=OPT-W65B3CP"
      type="text/javascript"
    />
  `);
  });

  it('callback correctly dispatches action', async() => {
    getCallback(store)('1', 'OCCkMMCZSwW87szzpniCow');
    expect(dispatch).toHaveBeenCalledWith(receiveExperiments(['OCCkMMCZSwW87szzpniCow', '1']));
  });
});
