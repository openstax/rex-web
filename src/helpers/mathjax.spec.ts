import { HTMLElement } from '@openstax/types/lib.dom';
import { typesetMath } from './mathjax';
import { assertWindow } from '../app/utils';

const mockMathJax = () => ({
  startup: { promise: Promise.resolve(), toMML: jest.fn() },
  typesetClear: jest.fn().mockResolvedValue(undefined),
  typesetPromise: jest.fn().mockImplementation((roots) => {
    roots?.forEach((root: HTMLElement) => {
      root.querySelectorAll('math, [data-math]').forEach((el) => el.remove());
    });
    return Promise.resolve();
  }),
});

beforeEach(() => {
  if (window) {
    window.MathJax = mockMathJax();
  }
});
afterEach(() => {
  if (window) {
    delete window.MathJax;
  }
});

describe('typesetMath', () => {
  it('does nothing for elements with no math', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');

    await typesetMath(element);

    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('typesets the element if it contains mathml', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    await typesetMath(element);

    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element]);
  });

  it('calls typesetPromise for each call with unprocessed nodes', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    const element2 = document.createElement('div');
    element2.appendChild(document.createElement('math'));

    await typesetMath(element);
    await typesetMath(element2);

    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element]);
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element2]);
  });

  it('typesets the element if it is data-math', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');
    const math1 = document.createElement('div');
    math1.setAttribute('data-math', 'formula1');

    const math2 = document.createElement('div');
    math2.setAttribute('data-math', 'formula2');

    element
      .appendChild(math1)
      .appendChild(math2)
    ;

    await typesetMath(element);

    // Updated: Now typesets the root element instead of individual nodes
    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element]);
  });

  it('moves latex formulas inline', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');
    const math1 = document.createElement('div');
    math1.setAttribute('data-math', 'formula1');

    const math2 = document.createElement('span');
    math2.setAttribute('data-math', 'formula2');

    element
      .appendChild(math1)
      .appendChild(math2)
    ;

    await typesetMath(element);

    expect(math1.textContent).toEqual('\u200c\u200c\u200cformula1\u200c\u200c\u200c');
    expect(math2.textContent).toEqual('\u200b\u200b\u200bformula2\u200b\u200b\u200b');
  });

  it('ignores math nodes inside mjx-assistive-mml elements', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');
    const assistiveMml = document.createElement('mjx-assistive-mml');
    const mathNode = document.createElement('math');
    assistiveMml.appendChild(mathNode);
    element.appendChild(assistiveMml);

    await typesetMath(element);

    // Should not call typesetPromise because math is inside mjx-assistive-mml
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalled();
  });

  it('waits for MathJax to initialize if startup.promise is not ready', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const originalMathJax = window.MathJax;
    window.MathJax = { startup: {} };

    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    let callCount = 0;
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
      callCount++;
      if (callCount === 2) {
        assertWindow().MathJax = originalMathJax;
      }
      cb();
      return 0 as any;
    });

    await typesetMath(element);

    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element]);

    setTimeoutSpy.mockRestore();
  });

  it('handles MathJax failing to load', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const consoleLogSpy = jest.spyOn(console, 'warn').mockImplementation();
    const originalMathJax = window.MathJax;

    window.MathJax = { startup: {} };

    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    // don't actually wait for all the retries
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
      cb();
      return 0 as any;
    });

    await typesetMath(element);

    expect(consoleLogSpy).toHaveBeenCalledWith('MathJax failed to load');
    expect(originalMathJax.typesetPromise).not.toHaveBeenCalled();

    window.MathJax = originalMathJax;
    consoleLogSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });
});
