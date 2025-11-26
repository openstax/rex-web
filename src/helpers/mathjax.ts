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

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T | void> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]).catch((error) => {
    console.warn(errorMessage, error); // tslint:disable-line:no-console
  });
};

export const typesetMath = async(root: Element, windowImpl = window) => {
  const latexNodes = findLatexNodes(root);
  const mathMLNodes = findUnprocessedMath(root);

  if (!windowImpl || (isEmpty(latexNodes) && isEmpty(mathMLNodes))) {
    return;
  }

  let retries = 0;
  const maxRetries = 5;
  let delay = 100;

  // give mathjax a chance to load
  while (!windowImpl.MathJax?.startup?.promise && retries < maxRetries) {
    const currentDelay = delay;
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    delay = delay * 2;
    retries++;
  }

  if (retries >= maxRetries) {
    console.warn('MathJax failed to load'); // tslint:disable-line:no-console
    return;
  }

  // Wait for MathJax to initialize with a timeout to prevent hanging indefinitely
  await withTimeout(
    windowImpl.MathJax.startup.promise,
    15000,
    'MathJax startup timed out after 15 seconds'
  );

  // If startup timed out, don't attempt to typeset
  if (!windowImpl.MathJax.typesetPromise) {
    return;
  }
  await new Promise(r => setTimeout(r, 100));
  await windowImpl.MathJax.typesetPromise([root]);
};
