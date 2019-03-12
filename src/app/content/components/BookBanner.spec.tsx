import React from 'react';
import renderer from 'react-test-renderer';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { BookBanner } from './BookBanner';

const book = {...archiveBook, slug: 'book-slug-1'};
const page = shortPage;

describe('BookBanner', () => {

  it('renders `null` with no page or book', () => {
    const component = renderer.create(<BookBanner />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when you pass a page and book', () => {
    const component = renderer.create(<BookBanner page={page} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders `null` when passed a page that isn\'t in the book tree', () => {
    const pageNotInTree = {...shortPage, id: 'asdfasdfasd'};
    const component = renderer.create(<BookBanner page={pageNotInTree} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
