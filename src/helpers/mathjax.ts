import { Element } from '@openstax/types/lib.dom';
import isEmpty from 'lodash/fp/isEmpty';

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

const typesetMath = async (root: Element, windowImpl = window) => {
  if (!windowImpl?.MathJax || !root.querySelector(COMBINED_MATH_SELECTOR)) {
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
};

export {
  typesetMath,
};
