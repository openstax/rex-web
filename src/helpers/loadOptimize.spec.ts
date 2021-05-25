import { Store } from '../app/types';
import { assertDocument, assertWindow } from '../app/utils';
import createTestStore from '../test/createTestStore';
import loadOptimize from './loadOptimize';

describe('loadOptimize', () => {
  let store: Store;
  let window: Window;
  const document = assertDocument();

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();
    window.gtag = jest.fn();
    window.dataLayer = [];

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

    const style = document.head.querySelector('style');
    if (style) {
      style.remove();
    }
    // tslint:disable: max-line-length
    expect(document.head.innerHTML).toMatchInlineSnapshot(
      `"<script type=\\"text/javascript\\" src=\\"https://www.googleoptimize.com/optimize.js?id=OPT-NFHSM4B\\"></script>"`
    );
  });

  it('injects correct <script> into head if in development', async() => {
    const newLocation = {
      ...window.location,
      hostname: 'foo',
    };
    delete (window as any).location;
    window.location = newLocation;

    await loadOptimize(window, store);
    const style = document.head.querySelector('style');
    if (style) {
      style.remove();
    }
    // tslint:disable: max-line-length
    expect(document.head.innerHTML).toMatchInlineSnapshot(
      `"<script type=\\"text/javascript\\" src=\\"https://www.googleoptimize.com/optimize.js?id=OPT-W65B3CP\\"></script>"`
    );
  });
});
