import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { Book, Page } from '../types';
import { createTitle } from './seoUtils';

describe('createTitle', () => {
  it('creates title for a page without a parent and without .os-text class in the title', () => {
    const page = makeArchiveSection('page1');
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [page]),
    };
    const title = createTitle(page as any as Page, book as any as Book);
    expect(title).toEqual('page1 - book | OpenStax');
  });

  it('creates title for answer key page', () => {
    const page = makeArchiveSection('<span class="os-text">chapter 1</span>');
    const answerKey = makeArchiveTree(
      '<span class="os-text">Answer Key</span>',
      [makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [answerKey]),
    };
    const title = createTitle(page as any as Page, book as any as Book);
    expect(title).toEqual('Answer Key chapter 1 - book | OpenStax');
  });

  it('creates title for a page inside a chapter', () => {
    const page = makeArchiveSection('<span class="os-text">page1</span>');
    const chapter = makeArchiveTree(
      '<span class="os-number">1</span><span class="os-text">Chapter</span>',
      [makeArchiveSection('some other page'), makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [chapter]),
    };
    const title = createTitle(page as any as Page, book as any as Book);
    expect(title).toEqual('Ch. 1 page1 - book | OpenStax');
  });

  it('creates title for a page which has a number and is inside a chapter', () => {
    const page = makeArchiveSection('<span class="os-number">3</span><span class="os-text">page1</span>');
    const chapter = makeArchiveTree(
      '<span class="os-number">1</span><span class="os-text">Chapter</span>',
      [makeArchiveTree('some nested chapter', [page])]
    );
    const book = {
      title: 'book',
      tree: makeArchiveTree('book', [chapter]),
    };
    const title = createTitle(page as any as Page, book as any as Book);
    expect(title).toEqual('3 page1 - book | OpenStax');
  });
});
