import { Store } from '../app/types';
import { assertWindow } from '../app/utils';
import createTestStore from '../test/createTestStore';
import loadOptimize from './loadOptimize';

describe('loadOptimize', () => {
  let store: Store;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    window.gtag = jest.fn();
    window.dataLayer = [];

    if (typeof document === 'undefined') {
      throw new Error('JSDom not loaded');
    }

    const createEvent = document.createEvent.bind(document);
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = jest.fn((type: string) => {
      const element = originalCreateElement(type);
      const event = createEvent('Event');
      event.initEvent('load');
      setTimeout(() => element.onload && element.onload(event), 1);

      return element;
    });
  });

  afterEach(() => {
    if (typeof document === 'undefined') {
      throw new Error('JSDom not loaded');
    }

    document.head.innerHTML = '';
  });

  it('injects correct <script> into head if in production', async() => {
    const newLocation = {
      ...window.location,
      hostname: 'openstax.org',
    };
    delete (window as any).location;
    window.location = newLocation;

    await loadOptimize(window, store);

    if (document && document.head) {
      const style = document.head.querySelector('style');
      if (style) {
        style.remove();
      }
      // tslint:disable: max-line-length
      expect(document.head.innerHTML).toMatchInlineSnapshot(
        `"<script type=\\"text/javascript\\" src=\\"https://www.googleoptimize.com/optimize.js?id=OPT-NFHSM4B\\"></script>"`
      );
    } else if (document) {
      expect(document).toBeTruthy();
      expect(document.head).toBeTruthy();
    } else {
      expect(document).toBeTruthy();
    }
  });

  it('injects correct <script> into head if in development', async() => {
    const newLocation = {
      ...window.location,
      hostname: 'foo',
    };
    delete (window as any).location;
    window.location = newLocation;

    await loadOptimize(window, store);

    if (document && document.head) {
      const style = document.head.querySelector('style');
      if (style) {
        style.remove();
      }
      // tslint:disable: max-line-length
      expect(document.head.innerHTML).toMatchInlineSnapshot(
        `"<script type=\\"text/javascript\\" src=\\"https://www.googleoptimize.com/optimize.js?id=OPT-W65B3CP\\"></script>"`
      );
    } else if (document) {
      expect(document).toBeTruthy();
      expect(document.head).toBeTruthy();
    } else {
      expect(document).toBeTruthy();
    }
  });
});
