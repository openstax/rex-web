import React from 'react';
import renderer from 'react-test-renderer';
import * as utils from '../utils';
import { Content } from './Content';

const book = {
  id: 'booklongid',
  shortId: 'book',
  title: 'book title',
};
const page = {
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
};

const pageArchive = {
  ...page,
  content: 'some page content yo',
};

describe('content', () => {
  let archiveLoader: jest.SpyInstance;

  beforeEach(() => {
    archiveLoader = jest.spyOn(utils, 'archiveLoader');
  });

  it('matches snapshot', (done) => {
    archiveLoader.mockImplementation((id: string) => {
      switch (id) {
        case 'book':
          return Promise.resolve(book);
        case 'book:page':
          return Promise.resolve(pageArchive);
        default:
          throw new Error('unknown id');
      }
    });

    const component = renderer.create(<Content book={book} page={page} loading={false} />);

    process.nextTick(() => {
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
});
