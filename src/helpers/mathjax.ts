import { Element, Node } from '@openstax/types/lib.dom';
import isEmpty from 'lodash/fp/isEmpty';
import { assertWindow } from '../app/utils';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const POLL_INTERVAL_MS = 50;

interface MathJaxMathItem {
  typesetRoot?: {
    appendChild: (node: Node) => void;
  };
  root?: Node;
}

interface MathJaxDocument {
  math: MathJaxMathItem[];
}

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
  options: {
    renderActions: {
      preserveOriginal: [150,
        // add mathml script tags after typesetting for both batch and individual items
        function(doc: MathJaxDocument) {
          for (const math of doc.math) {
            addMathMLScript(math);
          }
        },
        function(math: MathJaxMathItem, _doc: MathJaxDocument) {
          addMathMLScript(math);
        },
      ],
    },
  },
};

// adds a <script type="math/mml"> tag with the MathML so the highlighter can use it
const addMathMLScript = (math: MathJaxMathItem) => {
  const { typesetRoot, root } = math;
  if (!typesetRoot || !root || !window?.MathJax?.startup?.toMML || !document) { return; }

  const mml = window.MathJax.startup.toMML(root);
  const script = document.createElement('script');
  script.type = 'math/mml';
  script.text = mml;
  typesetRoot.appendChild(script);
}

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

const startMathJax = () => {
  const window = assertWindow();

  if (!window.MathJax) {
    window.MathJax = MATHJAX_CONFIG;
  } else if (!window.MathJax.typesetPromise) {
    window.MathJax = { ...window.MathJax, ...MATHJAX_CONFIG };
  }
};

export {
  typesetMath,
  startMathJax,
};
