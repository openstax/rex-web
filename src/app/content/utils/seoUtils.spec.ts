import makeArchiveLoader from '../../../test/mocks/archiveLoader';
import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { Book, Page } from '../types';
import { createTitle, getPageDescription } from './seoUtils';
import { contentPage, contentPageShort, contentPageWithObjectives, mockBook } from './seoUtils.constants';

// tslint:disable: object-literal-sort-keys max-line-length
describe('getDescription', () => {
  const loader = makeArchiveLoader();
  loader.mockBook(mockBook);

  it('makes a description for a content page', () => {
    loader.mockPage(mockBook, contentPage, 'page-slug');
    const description = getPageDescription(loader, mockBook, contentPage);
    expect(description).toMatchInlineSnapshot(
      `"For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and..."`
    );
  });

  it('makes a description for a content page with insufficient text', () => {
    loader.mockPage(mockBook, contentPageShort, 'page-slug');
    const description = getPageDescription(loader, mockBook, contentPageShort);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover the Unit Testing for Unit Testing of OpenStax's JavaScript Testing free textbook."`
      );
  });

  it('makes a description for a content page that begins with learning objectives', () => {
    loader.mockPage(mockBook, contentPageWithObjectives, 'page-slug');
    const description = getPageDescription(loader, mockBook, contentPageWithObjectives);
    expect(description).toMatchInlineSnapshot(
      `"The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space..."`
    );
  });

});

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
