import { Element, Node } from '@openstax/types/lib.dom';
import { debounce, memoize } from 'lodash';
import { assertDocument, assertWindow } from '../../../app/utils';
import {
  findLatexNodes,
  findUnprocessedMath,
  markLatexNodesRendered,
  MATH_MARKER_BLOCK,
  MATH_MARKER_INLINE,
} from '../shared';

declare global {
  interface Window {
    MathJax: any;
  }
}

// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl: Window = assertWindow()) => {
  if (windowImpl.MathJax && windowImpl.MathJax?.typesetPromise) {
    return getTypesetDocument(root, windowImpl)();
  }
  return Promise.resolve();
};

// memoize'd getter for typeset document function so that each node's
// typeset has its own debounce
const getTypesetDocument = memoize((root, windowImpl) => {
  // Install a debounce around typesetting function so that it will only run once
  // every Xms even if called multiple times in that period
  return debounce(_typesetMath, 100, {
    leading: true,
    trailing: false,
  }).bind(null, root, windowImpl);
});
getTypesetDocument.cache = new WeakMap();

const _typesetMath = async(root: Element, windowImpl: Window = assertWindow()) => {
  // Search document for math and [data-math] elements and then typeset them
  const nodes = findLatexNodes(root);
  if (findUnprocessedMath(root).length) {
    nodes.unshift(root);
  }

  return windowImpl.MathJax.typesetPromise(nodes).then(() => {
    markLatexNodesRendered(nodes);
  });
};

// The following should be called once and configures MathJax.
const startMathJax = () => {
  const window = assertWindow();
  const document = assertDocument();

  window.MathJax = {
    startup: {
      typeset: false,
      // There's a bug in MathJax that causes subsequent renders to typeset the assistiveMML <math>
      // child node embedded in the typeset container. So use a custom finder to skip them
      // (taken from https://github.com/mathjax/MathJax/issues/2770)
      ready() {
        const { combineDefaults } = window.MathJax._.components.global;
        const { FindMathML } = window.MathJax._.input.mathml.FindMathML;

        class MyFindMathML extends FindMathML {
          public processMath(set: Set<Node>) {
            for (const node of set.values()) {
              if (node.parentNode?.nodeName === 'MJX-ASSISTIVE-MML') {
                set.delete(node);
              }
            }
            return super.processMath(set);
          }
        }

        combineDefaults(window.MathJax.config, 'mml', { FindMathML: new MyFindMathML() });
        window.MathJax.startup.defaultReady();
      },
    },
    tex: {
      displayMath: [[MATH_MARKER_BLOCK, MATH_MARKER_BLOCK]],
      inlineMath: [[MATH_MARKER_INLINE, MATH_MARKER_INLINE]],
    },
  };

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.min.js';
  script.async = true;
  document.head.appendChild(script);
};

export {
  typesetMath,
  startMathJax,
};
