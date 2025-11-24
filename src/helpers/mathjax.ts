import { Element } from '@openstax/types/lib.dom';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/fp/isEmpty';
import memoize from 'lodash/fp/memoize';
import WeakMap from 'weak-map';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const POLL_INTERVAL_MS = 50;

const MATH_RENDERED_CLASS = 'math-rendered';
const MATH_DATA_SELECTOR = `[data-math]:not(.${MATH_RENDERED_CLASS})`;
const MATH_ML_SELECTOR   = `math:not(.${MATH_RENDERED_CLASS})`;
const COMBINED_MATH_SELECTOR = `${MATH_DATA_SELECTOR}, ${MATH_ML_SELECTOR}`;

const findUnprocessedMath = (root: Element): Element[] =>
  Array.from(root.querySelectorAll(`math:not(.${MATH_RENDERED_CLASS})`));

const findLatexNodes = (root: Element): Element[] => {
  const nodes = Array.from(root.querySelectorAll(MATH_DATA_SELECTOR));

  for (const node of nodes) {
    const formula = node.getAttribute('data-math');
    const marker = node.tagName.toLowerCase() === 'div' ? MATH_MARKER_BLOCK : MATH_MARKER_INLINE;
    node.textContent = `${marker}${formula}${marker}`;
  }

  return nodes;
};

const markNodesRendered = (nodes: Element[]) => {
  for (const node of nodes) {
    node.classList.add(MATH_RENDERED_CLASS);
  }
};

const typesetDocument = async(root: Element, windowImpl = window, remainingTries = 5): Promise<void> => {
  if (!windowImpl || !root.querySelector(COMBINED_MATH_SELECTOR)) {
    return;
  }

  const latexNodes = findLatexNodes(root);
  const mathMLNodes = findUnprocessedMath(root);

  if (isEmpty(latexNodes) && isEmpty(mathMLNodes)) {
    return;
  }

  while (!windowImpl.MathJax?.startup?.promise) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  await windowImpl.MathJax.startup.promise;
  await windowImpl.MathJax.typesetPromise([root]);

  markNodesRendered([...latexNodes, ...mathMLNodes]);

  // Check if there are still unprocessed nodes and retry if needed
  const unprocessedCount = root.querySelectorAll(COMBINED_MATH_SELECTOR).length;
  if (remainingTries > 0 && unprocessedCount > 0) {
    await typesetDocument(root, windowImpl, remainingTries - 1);
  }
};

const typesetDocumentPromise = (root: Element, windowImpl = window): Promise<void> =>
  typesetDocument(root, windowImpl);

// memoize'd getter for typeset document function so that each node's
// typeset has its own debounce
const getTypesetDocument = memoize((root: Element, windowImpl: Window) => {
  return debounce(typesetDocumentPromise, 100, {
    leading: true,
    trailing: false,
  }).bind(null, root, windowImpl);
});
getTypesetDocument.cache = new WeakMap();

// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl = window) => {
  if (windowImpl) {
    return getTypesetDocument(root, windowImpl)();
  }

  return Promise.resolve();
};

export {
  typesetMath,
};
