import { Node } from '@openstax/types/lib.dom';
import { filterMathNodes, startMathJax, typesetMath } from '.';

const debounce = () => new Promise((resolve) => setTimeout(resolve, 150));

const mockMathJax = () => ({
  startup: {
    ready: jest.fn(),
  },
  typesetPromise: jest.fn(() => Promise.resolve()),
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
  it('does nothing if mathjax is not loaded', async() => {
    if (!document) {
      expect(document).toBeTruthy();
      return;
    }

    delete window?.MathJax;
    const element = document.createElement('div');
    expect(() => {
      const typeset = typesetMath(element);
      expect(typeset).toBeInstanceOf(Promise);
    }).not.toThrowError();

    await debounce();
  });

  it('does nothing for elements with no math', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');

    typesetMath(element);

    await debounce();

    expect(window.MathJax.typesetPromise).not.toHaveBeenCalledWith();
  });

  it('typesets the element if it contains mathml', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }
    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    typesetMath(element);

    await debounce();

    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([element]);
  });

  it('debounces', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const element = document.createElement('div');
    element.appendChild(document.createElement('math'));

    const element2 = document.createElement('div');
    element2.appendChild(document.createElement('math'));

    typesetMath(element);
    typesetMath(element);
    typesetMath(element);
    typesetMath(element2);
    typesetMath(element2);
    typesetMath(element2);
    typesetMath(element);
    typesetMath(element2);
    typesetMath(element);

    await debounce();

    expect(window.MathJax.typesetPromise).toHaveBeenCalledTimes(2);
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

    typesetMath(element);

    await debounce();

    expect(window.MathJax.typesetPromise).toHaveBeenCalledWith([math1, math2]);
    expect(window.MathJax.typesetPromise).not.toHaveBeenCalledWith(element);
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

    typesetMath(element);

    await debounce();

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
  });

  it('configs mathjax', () => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    delete window.MathJax;

    startMathJax();

    const { MathJax } = window;

    expect(document.head.innerHTML).toMatch(/mathjax.+js/);
    expect(MathJax.startup.ready).toBeInstanceOf(Function);
    expect(MathJax.startup.typeset).toBe(false);
    expect(MathJax.tex).toBeInstanceOf(Object);

    let calledSuper = false;

    const combineDefaults = (_: object, __: string, defaults: any) => {
      MathJax.config = { mml: { FindMathML: defaults.FindMathML } }
    }

    class FindMathML {
      public processMath() {
        calledSuper = true;
      }
    }

    MathJax._ = {
      components: {
        global: {
          combineDefaults: combineDefaults,
        }
      },
      input: {
        mathml: {
          FindMathML: {
            FindMathML
          }
        }
      }
    }

    const defaultReady = jest.fn();
    MathJax.startup.defaultReady = defaultReady;
    MathJax.startup.ready();

    expect(defaultReady).toHaveBeenCalled();
    MathJax.config.mml.FindMathML.processMath([]);
    expect(calledSuper).toBe(true);
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
      } catch (e) {
        message = e.message;
      }

      expect(message).toBe('BUG: Window is undefined');
    });
  });
});

describe('filterMathNodes', () => {
  it('filters out assistive mml nodes', () => {
    if (!document) {
      expect(document).toBeTruthy();
      return;
    }

    const node1 = document.createElement('div');
    node1.setAttribute('data-math', 'formula1');
    const assistiveNode = document.createElement('mjx-assistive-mml');
    const node2 = document.createElement('div');
    node2.setAttribute('data-math', 'formula1');
    assistiveNode.appendChild(node2);

    const nodes: Set<Node> = new Set();
    nodes.add(node1);
    nodes.add(node2);

    const newSet = filterMathNodes(nodes);
    expect(Array.from(newSet)).toEqual([node1]);
  });
});
