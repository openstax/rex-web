import { Element } from '@openstax/types/lib.dom';
import isEmpty from 'lodash/fp/isEmpty';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const MATH_DATA_SELECTOR = '[data-math]';
const MATH_ML_SELECTOR   = 'math';

const isNotInsideAssistiveMml = (node: Element): boolean => !node.closest('mjx-assistive-mml');

const findUnprocessedMath = (root: Element): Element[] =>
  Array.from(root.querySelectorAll(MATH_ML_SELECTOR)).filter(isNotInsideAssistiveMml);

const findLatexNodes = (root: Element): Element[] => {
  const nodes = Array.from(root.querySelectorAll(MATH_DATA_SELECTOR));

  for (const node of nodes) {
    const formula = node.getAttribute('data-math');
    const marker = node.tagName.toLowerCase() === 'div' ? MATH_MARKER_BLOCK : MATH_MARKER_INLINE;
    node.textContent = `${marker}${formula}${marker}`;
  }

  return nodes;
};

const waitForMathJax = async(windowImpl: Window) => {
  let retries = 0;
  const maxRetries = 20;
  let delay = 100;

  // give mathjax a chance to load
  while (!windowImpl.MathJax?.startup?.promise && retries < maxRetries) {
    const currentDelay = delay;
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    delay = Math.min(delay * 2, 1000);
    retries++;
  }

  if (retries >= maxRetries || !windowImpl.MathJax?.startup?.promise) {
    console.warn('MathJax failed to load'); // tslint:disable-line:no-console
    return false;
  }
  await windowImpl.MathJax.startup.promise;
  return true;
};

export const typesetMath = async(root: Element, windowImpl = window) => {
  const latexNodes = findLatexNodes(root);
  const mathMLNodes = findUnprocessedMath(root);

  if (!windowImpl || (isEmpty(latexNodes) && isEmpty(mathMLNodes))) {
    return;
  }

  const loaded = await waitForMathJax(windowImpl);
  if (!loaded) {
    return;
  }

  await windowImpl.MathJax.typesetClear([root]);
  await windowImpl.MathJax.typesetPromise([root]);
};
