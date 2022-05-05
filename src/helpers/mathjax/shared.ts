import { Element } from '@openstax/types/lib.dom';

export const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
export const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

export const MATH_RENDERED_CLASS = 'math-rendered';
export const MATH_DATA_SELECTOR = `[data-math]:not(.${MATH_RENDERED_CLASS})`;
export const MATH_ML_SELECTOR   = `math:not(.${MATH_RENDERED_CLASS})`;
export const COMBINED_MATH_SELECTOR = `${MATH_DATA_SELECTOR}, ${MATH_ML_SELECTOR}`;
export const ASSISTIVE_MATH_ML_SELECTOR = `mjx-assistive-mml ${MATH_ML_SELECTOR}`;

export const findProcessedMath = (root: Element): Element[] => Array.from(root.querySelectorAll('.MathJax math'));
export const findUnprocessedMath = (root: Element): Element[] => {
  const processedMath = findProcessedMath(root);
  return Array.from(root.querySelectorAll('math')).filter((node) => processedMath.indexOf(node) === -1);
};

export const findLatexNodes = (root: Element): Element[] => {
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

export const markLatexNodesRendered = (latexNodes: Element[]) => () => {
  // Queue a call to mark the found nodes as rendered so are ignored if typesetting is called repeatedly
  // uses className += instead of classList because IE
  const result = [];
  for (const node of latexNodes) {
    result.push(node.className += ` ${MATH_RENDERED_CLASS}`);
  }
};
