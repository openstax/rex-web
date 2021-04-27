import createTestServices from '../../../test/createTestServices';
import makeArchiveLoader from '../../../test/mocks/archiveLoader';
import makeArchiveSection from '../../../test/mocks/archiveSection';
import makeArchiveTree from '../../../test/mocks/archiveTree';
import { useServices } from '../../context/Services';
import { Book, Page } from '../types';
import { formatBookData } from '../utils';
import { createTitle, getPageDescription } from './seoUtils';
import {
  answerKeyPage,
  contentPage,
  contentPageShort,
  contentPageWithObjectives,
  eobPage,
  eocPage,
  mockBook,
  mockOsWebBook,
  subpage,
} from './seoUtils.spec.data';

// tslint:disable: max-line-length
describe('getDescription', () => {
  const loader = makeArchiveLoader();
  const book = formatBookData(mockBook, mockOsWebBook);
  const services = {
    intl: createTestServices().intlProvider,
    loader,
  };
  loader.mockBook(book);

  it('makes a description for content page', () => {
    loader.mockPage(book, contentPage, 'page-slug');
    const description = getPageDescription(services, book, contentPage);
    expect(description).toMatchInlineSnapshot(
      `"For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and..."`
    );
  });

  it('makes a description for content page with insufficient text', () => {
    loader.mockPage(book, contentPageShort, 'page-slug');
    const description = getPageDescription(services, book, contentPageShort);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover the Best Practices for Chapter 1. What is a test? of OpenStax's JavaScript Testing free textbook."`
    );
  });

  it('makes a description for content page with learning objectives', () => {
    loader.mockPage(book, contentPageWithObjectives, 'page-slug');
    const description = getPageDescription(services, book, contentPageWithObjectives);
    expect(description).toMatchInlineSnapshot(
      `"This is the paragraph that comes after the learning objectives section. It does not have any special classes applied...."`
    );
  });

  it('makes a description for answer key page', () => {
    loader.mockPage(book, answerKeyPage, 'page-slug');
    const description = getPageDescription(services, book, answerKeyPage);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover the Answer Key for Chapter 3 of OpenStax's JavaScript Testing free textbook."`
    );
  });

  it('makes a description for end-of-chapter page', () => {
    loader.mockPage(book, eocPage, 'page-slug');
    const description = getPageDescription(services, book, eocPage);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover the Review Questions for Chapter 1. What is a test? of OpenStax's JavaScript Testing free textbook."`
    );
  });

  it('makes a description for end-of-chapter subpage', () => {
    loader.mockPage(book, subpage, 'page-slug');
    const description = getPageDescription(services, book, subpage);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover Chapter Review: Key Concepts for Chapter 2. Unit Testing of OpenStax's JavaScript Testing free textbook."`
    );
  });

  it('makes a description for end-of-book page', () => {
    loader.mockPage(book, eobPage, 'page-slug');
    const description = getPageDescription(services, book, eobPage);
    expect(description).toMatchInlineSnapshot(
      `"On this page you will discover the References for OpenStax's JavaScript Testing free textbook."`
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
