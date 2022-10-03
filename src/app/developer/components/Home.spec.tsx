import React from 'react';
import renderer from 'react-test-renderer';
import * as booksConfig from '../../../gateways/createBookConfigLoader';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book } from '../../../test/mocks/archiveLoader';
import TestContainer from '../../../test/TestContainer';
import Home from './Home';

const mockBooksConfig = {
  archiveUrl: book.loadOptions.booksConfig.archiveUrl,
  books: {
    'some-id': {
      defaultVersion: '1.0',
    },
    'some-id-2': {
      defaultVersion: '1.0',
    },
  },
};

describe('Home', () => {
  const store = createTestStore();
  const services = {
    ...createTestServices(),
    dispatch: store.dispatch,
    getState: store.getState,
  };

  beforeEach(() => {
    jest.spyOn(booksConfig, 'getBooksConfigSync').mockReturnValue(mockBooksConfig);

    services.archiveLoader.mockBook({
      ...book,
      id: 'some-id',
      loadOptions: {booksConfig: mockBooksConfig},
      title: 'booktitle',
    } as any);
    services.archiveLoader.mockBook({
      ...book,
      id: 'some-id-2',
      loadOptions: {booksConfig: mockBooksConfig},
      title: 'booktitle2',
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('matches snapshot', async() => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2021);
    const component = renderer.create(<TestContainer services={services}>
      <Home />
    </TestContainer>);

    await renderer.act(async() => {
      // defer promises...
      await new Promise((resolve) => setTimeout(resolve, 1));
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
