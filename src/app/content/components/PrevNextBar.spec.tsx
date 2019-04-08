import React from 'react';
import renderer from 'react-test-renderer';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../utils';
import { PrevNextBar } from './PrevNextBar';

const book = formatBookData(archiveBook, mockCmsBook);

describe('PrevNextBar', () => {

  it('renders `null` with no page or book', () => {
    const component = renderer.create(<PrevNextBar />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when you pass a page and book', () => {
    const component = renderer.create(<PrevNextBar page={shortPage} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders `null` when passed a page that isn\'t in the book tree', () => {
    const pageNotInTree = {...shortPage, id: 'asdfasdfasd'};
    const component = renderer.create(<PrevNextBar page={pageNotInTree} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
