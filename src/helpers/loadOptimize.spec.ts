import { Store } from '../app/types';
import { assertWindow } from '../app/utils';
import createTestStore from '../test/createTestStore';
import loadOptimize from './loadOptimize';
import * as loadOptimizeFile from './loadOptimize';

describe('loadOptimize', () => {
  let store: Store;
  let gtag: (eventKey: string, eventVal: string, eventObj: object) => boolean;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();

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

  it('injects <script> into head', async() => {
    await loadOptimize(window, store);

    jest
      .spyOn(loadOptimizeFile, 'getOptimizeContainerByEnv')
      .mockReturnValue('OPT-W65B3CP');

    // tslint:disable: max-line-length
    if (document && document.head) {
      const style = document.head.querySelector('style');
      if (style) {
        style.remove();
      }
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
