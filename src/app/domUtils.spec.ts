import scrollTo from 'scroll-to-element';
import { elementDescendantOf, scrollIntoView } from './domUtils';
import { assertDocument, assertWindow } from './utils';

jest.mock('scroll-to-element');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollIntoView', () => {
  it('scrolls up', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: -40,
      top: -50,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('scrolls down', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      top: 0,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });
});

describe('elementDescendantOf', () => {
  const document = assertDocument();

  it('finds ancestor', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(elementDescendantOf(child, parent)).toBe(true);
  });

  it('defaults to false if it can\'t find the ancestor', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    expect(elementDescendantOf(child, parent)).toBe(false);
  });

  it('defaults to true if the child is the ancestor', () => {
    const child = document.createElement('div');

    expect(elementDescendantOf(child, child)).toBe(true);
  });
});
