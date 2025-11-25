import { Element } from '@openstax/types/lib.dom';
import isEmpty from 'lodash/fp/isEmpty';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const POLL_INTERVAL_MS = 50;

const MATH_DATA_SELECTOR = '[data-math]';
const MATH_ML_SELECTOR   = 'math';
const COMBINED_MATH_SELECTOR = `${MATH_DATA_SELECTOR}, ${MATH_ML_SELECTOR}`;

const findUnprocessedMath = (root: Element): Element[] =>
  Array.from(root.querySelectorAll(MATH_ML_SELECTOR));

const findLatexNodes = (root: Element): Element[] => {
  const nodes = Array.from(root.querySelectorAll(MATH_DATA_SELECTOR));

  for (const node of nodes) {
    const formula = node.getAttribute('data-math');
    const marker = node.tagName.toLowerCase() === 'div' ? MATH_MARKER_BLOCK : MATH_MARKER_INLINE;
    node.textContent = `${marker}${formula}${marker}`;
  }

  return nodes;
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
  await windowImpl.MathJax.typesetClear([root]);
  await windowImpl.MathJax.typesetPromise([root]);

  const unprocessedCount = root.querySelectorAll(COMBINED_MATH_SELECTOR).length;
  if (remainingTries > 0 && unprocessedCount > 0) {
    await typesetDocument(root, windowImpl, remainingTries - 1);
  }
};

// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl = window): Promise<void> => {
  if (windowImpl) {
    return typesetDocument(root, windowImpl);
  }

  return Promise.resolve();
};

export {
  typesetMath,
};
