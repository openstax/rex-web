import { Element } from '@openstax/types/lib.dom';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/fp/isEmpty';
import memoize from 'lodash/fp/memoize';
import WeakMap from 'weak-map';
import { assertWindow } from '../../../app/utils';
import {
  COMBINED_MATH_SELECTOR,
  findLatexNodes,
  findUnprocessedMath,
  markLatexNodesRendered,
  MATH_MARKER_BLOCK,
  MATH_MARKER_INLINE
} from '../shared';

const MATHJAX_CONFIG = {
  extensions: [],
  showProcessingMessages: false,
  skipStartupTypeset: true,
  styles: {
    '#MathJax_MSIE_Frame': {
      left: '', right: 0, visibility: 'hidden',
    },
    '#MathJax_Message': {
      left: '', right: 0, visibility: 'hidden',
    },
  },
  tex2jax: {
    displayMath: [[MATH_MARKER_BLOCK, MATH_MARKER_BLOCK]],
    inlineMath:  [[MATH_MARKER_INLINE, MATH_MARKER_INLINE]],
  },
};

const typesetLatexNodes = (latexNodes: Element[], windowImpl: Window) => () => {
  if (isEmpty(latexNodes)) {
    return;
  }

  windowImpl.MathJax.Hub.Queue(
    () => windowImpl.MathJax.Hub.Typeset(latexNodes),
    markLatexNodesRendered(latexNodes)
  );
};

const typesetMathMLNodes = (root: Element, windowImpl: Window) => () => {
  const mathMLNodes = findUnprocessedMath(root);

  if (isEmpty(mathMLNodes)) {
    return;
  }

  // style the entire document because mathjax is unable to style individual math elements
  windowImpl.MathJax.Hub.Queue(
    () => windowImpl.MathJax.Hub.Typeset(root)
  );
};

// Search document for math and [data-math] elements and then typeset them
function typesetDocument(root: Element, windowImpl: Window) {
  const latexNodes = findLatexNodes(root);

  windowImpl.MathJax.Hub.Queue(
    typesetLatexNodes(latexNodes, windowImpl),
    typesetMathMLNodes(root, windowImpl)
  );
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

const typesetDocumentPromise = (root: Element, windowImpl: Window): Promise<void> => new Promise((resolve) => {
  typesetDocument(root, windowImpl);
  windowImpl.MathJax.Hub.Queue(() => {
    resolveOrWait(root, resolve);
  });
});

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
  if (windowImpl && windowImpl.MathJax && windowImpl.MathJax.Hub && root.querySelector(COMBINED_MATH_SELECTOR)) {
    return getTypesetDocument(root, windowImpl)();
  }

  return Promise.resolve();
};

// The following should be called once and configures MathJax.
// Assumes the script to load MathJax is of the form:
// `...MathJax.js?config=TeX-MML-AM_HTMLorMML-full&amp;delayStartupUntil=configured`
function startMathJax() {
  const window = assertWindow();
  const document = window.document;

  (() => {
    const script = document.createElement('script');
    const path = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js';
    script.src = `${path}?config=TeX-MML-AM_HTMLorMML-full&delayStartupUntil=configured`;
    script.async = true;
    document.head.appendChild(script);
  })();

  const configuredCallback = () => {
    // there doesn't seem to be a config option for this
    window.MathJax.HTML.Cookie.prefix = 'mathjax';
    // proceed with mathjax initi
    window.MathJax.Hub.Configured();
  };

  if (window.MathJax && window.MathJax.Hub) {
    window.MathJax.Hub.Config(MATHJAX_CONFIG);
    // Does not seem to work when passed to Config
    window.MathJax.Hub.processSectionDelay = 0;
    return configuredCallback();
  } else {
    // If the MathJax.js file has not loaded yet:
    // Call MathJax.Configured once MathJax loads and
    // loads this config JSON since the CDN URL
    // says to `delayStartupUntil=configured`
    (MATHJAX_CONFIG as any).AuthorInit = configuredCallback;
    return window.MathJax = MATHJAX_CONFIG;
  }
}

export {
  typesetMath,
  startMathJax,
};
