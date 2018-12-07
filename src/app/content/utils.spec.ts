import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTocSectionIntoView, stripIdVersion } from './utils';

describe('stripIdVersion', () => {
  it('strips ids', () => {
    expect(stripIdVersion('asdf@qwer')).toEqual('asdf');
  });

  it('doesn\'t break with no id', () => {
    expect(stripIdVersion('asdf')).toEqual('asdf');
  });
});

describe('scrollTocSectionIntoView', () => {
  let activeSection: HTMLElement;
  let activeChapter: HTMLElement;
  let sidebar: HTMLElement;

  beforeEach(() => {
    if (!document) {
      throw new Error('jsdom...');
    }
    activeSection = document.createElement('li');
    activeChapter = document.createElement('li');
    sidebar = document.createElement('div');

    Object.defineProperty(sidebar, 'scrollTop', {value: 0, writable: true});
    Object.defineProperty(sidebar, 'offsetHeight', {value: 1000, writable: true});
  });

  it('does nothing if activeSection is undefined', () => {
    scrollTocSectionIntoView(sidebar, undefined);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('does nothing if sidebar is undefined', () => {
    expect(() => scrollTocSectionIntoView(undefined, activeSection)).not.toThrow();
  });

  it('does nothing if section is already visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', {value: 500});
    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('udpates scroll position if the section is not visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', {value: 1500});
    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });

  it('udpates scroll position to the chapter heading if its available and it fits', () => {
    Object.defineProperty(activeChapter, 'offsetTop', {value: 1400});
    Object.defineProperty(activeSection, 'offsetTop', {value: 1500});
    Object.defineProperty(activeSection, 'parentElement', {value: activeChapter});

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('udpates scroll position to the section heading if the chapter is too long', () => {
    Object.defineProperty(activeChapter, 'offsetTop', {value: 1000});
    Object.defineProperty(activeSection, 'offsetTop', {value: 2500});
    Object.defineProperty(activeSection, 'parentElement', {value: activeChapter});

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(2500);
  });

  it('searches through multiple levels to find the chapter', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', {value: 1400});
    Object.defineProperty(activeSection, 'offsetTop', {value: 1500});
    Object.defineProperty(activeSection, 'parentElement', {value: randoElement2});
    Object.defineProperty(randoElement2, 'parentElement', {value: randoElement1});
    Object.defineProperty(randoElement1, 'parentElement', {value: activeChapter});

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('stops searching when it finds the sidebar', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', {value: 1400});
    Object.defineProperty(activeSection, 'offsetTop', {value: 1500});
    Object.defineProperty(activeSection, 'parentElement', {value: randoElement2});
    Object.defineProperty(randoElement2, 'parentElement', {value: randoElement1});
    Object.defineProperty(randoElement1, 'parentElement', {value: sidebar});
    Object.defineProperty(sidebar, 'parentElement', {value: activeChapter});

    scrollTocSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });
});
