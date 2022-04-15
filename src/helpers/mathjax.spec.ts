import { assertDocument, assertWindow } from '../app/utils';
import { startMathJax, typesetMath } from './mathjax';
import { startMathJax as startMathJax2, typesetMath as typesetMath2 } from './mathjax/v2';
import { startMathJax as startMathJax3, typesetMath as typesetMath3 } from './mathjax/v3';

jest.mock('./mathjax/v2', () => ({
  startMathJax: jest.fn(),
  typesetMath: jest.fn(),
}));

jest.mock('./mathjax/v3', () => ({
  startMathJax: jest.fn(),
  typesetMath: jest.fn(),
}));

describe('v2', () => {
  it('starts to the correct version', () => {
    startMathJax();
    expect(startMathJax2).toHaveBeenCalled();
  });

  it('calls the correct version', () => {
    const element = assertDocument().createElement('div');
    typesetMath(element);
    expect(typesetMath2).toHaveBeenCalled();
  });
});

describe('v3', () => {
  beforeEach(() => {
    Object.defineProperty(assertWindow(), 'location', {
      value: {
        search: 'mathjax-version=3',
      },
    });
  });

  it('starts the correct version', () => {
    startMathJax();
    expect(startMathJax3).toHaveBeenCalled();
  });

  it('calls the correct version', () => {
    const element = assertDocument().createElement('div');
    typesetMath(element);
    expect(typesetMath3).toHaveBeenCalled();
  });
});
