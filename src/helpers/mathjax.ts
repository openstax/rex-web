import { Element } from '@openstax/types/lib.dom';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/fp/isEmpty';
import memoize from 'lodash/fp/memoize';
import WeakMap from 'weak-map';
import { assertWindow } from '../app/utils';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const MATH_RENDERED_CLASS = 'math-rendered';
const MATH_DATA_SELECTOR = `[data-math]:not(.${MATH_RENDERED_CLASS})`;
const MATH_ML_SELECTOR   = `math:not(.${MATH_RENDERED_CLASS})`;
const COMBINED_MATH_SELECTOR = `${MATH_DATA_SELECTOR}, ${MATH_ML_SELECTOR}`;
const MATHJAX_CONFIG = {
  startup: {
    typeset: false,
  },
  tex: {
    displayMath: [[MATH_MARKER_BLOCK, MATH_MARKER_BLOCK]],
    inlineMath:  [[MATH_MARKER_INLINE, MATH_MARKER_INLINE]],
  },
};

const findUnprocessedMath = (root: Element): Element[] => {
  const allMath = Array.from(root.querySelectorAll('math'));
  // processed MathML elements are wrapped in mjx-container
  // unprocessed math elements won't have mjx-container as a parent
  return allMath.filter((node) => !node.parentElement?.closest('mjx-container'));
};

const findLatexNodes = (root: Element): Element[] => {
  const latexNodes: Element[] = [];
  for (const node of Array.from(root.querySelectorAll(MATH_DATA_SELECTOR))) {
    const formula = node.getAttribute('data-math');
    // divs should be rendered as a block, others inline
    if (node.tagName.toLowerCase() === 'div') {
      node.textContent = `${MATH_MARKER_BLOCK}${formula}${MATH_MARKER_BLOCK}`;
    } else {
      node.textContent = `${MATH_MARKER_INLINE}${formula}${MATH_MARKER_INLINE}`;
    }
    latexNodes.push(node);
  }

  return latexNodes;
};

const typesetLatexNodes = async (latexNodes: Element[], windowImpl: Window) => {
  if (isEmpty(latexNodes)) {
    return;
  }

  await windowImpl.MathJax.typesetPromise(latexNodes);
  markLatexNodesRendered(latexNodes)();
};

const typesetMathMLNodes = async (root: Element, windowImpl: Window) => {
  const mathMLNodes = findUnprocessedMath(root);

  if (isEmpty(mathMLNodes)) {
    return;
  }

  // style the entire document because mathjax is unable to style individual math elements
  await windowImpl.MathJax.typesetPromise([root]);
};

const markLatexNodesRendered = (latexNodes: Element[]) => () => {
  // Queue a call to mark the found nodes as rendered so are ignored if typesetting is called repeatedly
  // uses className += instead of classList because IE
  const result = [];
  for (const node of latexNodes) {
    result.push(node.className += ` ${MATH_RENDERED_CLASS}`);
  }
};

// Search document for math and [data-math] elements and then typeset them
async function typesetDocument(root: Element, windowImpl: Window) {
  const latexNodes = findLatexNodes(root);

  await typesetLatexNodes(latexNodes, windowImpl);
  await typesetMathMLNodes(root, windowImpl);
}

const resolveOrWait = (root: Element, resolve: () => void, remainingTries = 5) => {
  if (
    remainingTries > 0
    && (findLatexNodes(root).length || findUnprocessedMath(root).length)
  ) {
    setTimeout(() => {
      resolveOrWait(root, resolve, remainingTries - 1);
    }, 200);
  } else {
    resolve();
  }
};

const typesetDocumentPromise = async (root: Element, windowImpl: Window): Promise<void> => {
  await typesetDocument(root, windowImpl);
  return new Promise((resolve) => {
    resolveOrWait(root, resolve);
  });
};

// memoize'd getter for typeset document function so that each node's
// typeset has its own debounce
const getTypesetDocument = memoize((root, windowImpl) => {
  // Install a debounce around typesetting function so that it will only run once
  // every Xms even if called multiple times in that period
  return debounce(typesetDocumentPromise, 100, {
    leading: true,
    trailing: false,
  }).bind(null, root, windowImpl);
});
getTypesetDocument.cache = new WeakMap();

// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl = window) => {
  // schedule a Mathjax pass if there is at least one [data-math] or <math> element present
  if (windowImpl && windowImpl.MathJax && windowImpl.MathJax.typesetPromise && root.querySelector(COMBINED_MATH_SELECTOR)) {
    return getTypesetDocument(root, windowImpl)();
  }

  return Promise.resolve();
};

// The following should be called once and configures MathJax.
// Configuration must be set before the script loads.
function startMathJax() {
  const window = assertWindow();

  // Set MathJax configuration before the script loads
  if (!window.MathJax) {
    window.MathJax = MATHJAX_CONFIG;
  } else if (window.MathJax && !window.MathJax.typesetPromise) {
    // MathJax config exists but script hasn't loaded yet - merge configs
    window.MathJax = { ...MATHJAX_CONFIG, ...window.MathJax };
  }
  // If MathJax.typesetPromise exists, it's already loaded and configured
}

export {
  typesetMath,
  startMathJax,
};
