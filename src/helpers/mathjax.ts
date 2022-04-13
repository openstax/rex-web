import { Element } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import { startMathJax as startMathJax2, typesetMath as typesetMath2 } from './mathjax/v2';
import { startMathJax as startMathJax3, typesetMath as typesetMath3 } from './mathjax/v3';

interface MathJaxWindow extends Window {
  __MJX_VERSION?: number;
}

export const startMathJax = () => {
  const window: MathJaxWindow = assertWindow();
  const params = new URLSearchParams(window.location.search);
  const version = params.get('mathjax-version');

  if (version === '3') {
    window.__MJX_VERSION = 3;
    startMathJax3();
  } else {
    window.__MJX_VERSION = 2;
    startMathJax2();
  }
};

export const typesetMath = (container: Element, windowImpl: MathJaxWindow = assertWindow()) => {
  if (windowImpl.__MJX_VERSION === 3) {
    return typesetMath3(container, windowImpl);
  } else {
    return typesetMath2(container, windowImpl);
  }
};
