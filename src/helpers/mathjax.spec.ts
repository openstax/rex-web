import { startMathJax, typesetMath } from './mathjax';

const mockMathJax = () => ({
  startup: { promise: Promise.resolve(), toMML: jest.fn() },
  typesetPromise: jest.fn().mockResolvedValue(undefined),
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

    // Each element gets typeset once (nodes are marked after first call)
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
});

describe('startMathJax', () => {
  it('loads config if mathjax is not defined', () => {
    if (!window) {
      expect(window).toBeTruthy();
      return;
    }
    delete window.MathJax;

    startMathJax();

    expect(window.MathJax).toBeDefined();
    expect(window.MathJax.startup).toBeDefined();
    expect(window.MathJax.tex).toBeDefined();
  });

  it('does not overwrite config if mathjax is already loaded', () => {
    if (!window) {
      expect(window).toBeTruthy();
      return;
    }

    const existingMathJax = mockMathJax();
    window.MathJax = existingMathJax;

    startMathJax();

    expect(window.MathJax).toBe(existingMathJax);
  });

  describe('outside the browser', () => {
    const windowBak = window;

    beforeEach(() => {
      delete (global as any).window;
    });
    afterEach(() => {
      (global as any).window = windowBak;
    });

    it('throws', () => {
      let message = null;

      try {
        startMathJax();
      } catch (e: any) {
        message = e.message;
      }

      expect(message).toBe('BUG: Window is undefined');
    });
  });
});
