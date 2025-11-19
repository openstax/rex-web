import { Element } from '@openstax/types/lib.dom';
import isEmpty from 'lodash/fp/isEmpty';
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
  const allMath = Array.from(root.querySelectorAll(`math:not(.${MATH_RENDERED_CLASS})`));
  return allMath;
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

const markNodesRendered = (nodes: Element[]) => {
  // Mark nodes as rendered so they are ignored if typesetting is called repeatedly
  // uses className += instead of classList because IE
  for (const node of nodes) {
    node.className += ` ${MATH_RENDERED_CLASS}`;
  }
};

// Ensure MathJax is fully ready before attempting to typeset
async function ensureMathJaxReady(windowImpl: Window): Promise<void> {
  // Wait for MathJax.startup.promise to ensure all components are loaded and initialized
  // This promise is set up during MathJax's startup sequence and resolves when
  // MathJax is fully initialized including all internal components
  if (windowImpl.MathJax?.startup?.promise) {
    try {
      await windowImpl.MathJax.startup.promise;
    } catch (error) {
      // startup.promise may reject if initial typesetting fails, but MathJax is still ready
      // We can safely continue as long as typesetPromise exists
    }
  }

  // Additional guard: if startup.promise doesn't exist but MathJax is loading,
  // we need to wait for it. Poll for a short time to let async script finish loading.
  const maxWaitMs = 5000;
  const pollIntervalMs = 50;
  const startTime = Date.now();

  while (!windowImpl.MathJax?.typesetPromise && (Date.now() - startTime) < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
}

// Search document for math and [data-math] elements and then typeset them
async function typesetDocument(root: Element, windowImpl: Window) {
  const latexNodes = findLatexNodes(root);
  const mathMLNodes = findUnprocessedMath(root);

  if (isEmpty(latexNodes) && isEmpty(mathMLNodes)) {
    return;
  }

  await ensureMathJaxReady(windowImpl);
  // typeset both LaTeX and MathML
  await windowImpl.MathJax.typesetPromise([root]);
  markNodesRendered([...latexNodes, ...mathMLNodes]);
}


// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl = window) => {
  // schedule a Mathjax pass if there is at least one [data-math] or <math> element present
  // Check if MathJax exists (script is loading or loaded) and if there's math to process
  if (windowImpl && windowImpl.MathJax && root.querySelector(COMBINED_MATH_SELECTOR)) {
    return typesetDocument(root, windowImpl);
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
