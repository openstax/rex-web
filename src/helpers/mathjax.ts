import { Element } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import { startMathJax as startMathJax2, typesetMath as typesetMath2 } from './mathjax/v2';
import { startMathJax as startMathJax3, typesetMath as typesetMath3 } from './mathjax/v3';

const getMathJaxQueryParam = () => {
  const params = new URLSearchParams(assertWindow().location.search);
  return params.get('mathjax-version');
};

export const startMathJax = () => {
  if (getMathJaxQueryParam() === '3') {
    startMathJax3();
  } else {
    startMathJax2();
  }
};

export const typesetMath = (container: Element, windowImpl: Window = assertWindow()) => {
  if (getMathJaxQueryParam() === '3') {
    return typesetMath3(container, windowImpl);
  } else {
    return typesetMath2(container, windowImpl);
  }
};
