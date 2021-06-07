import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import { book } from '../../../test/mocks/archiveLoader';
import TestContainer from '../../../test/TestContainer';
import Home from './Home';

jest.mock('../../../config.books', () => ({
  'some-id': {
    defaultVersion: '1.0',
  },
  'some-id-2': {
    defaultVersion: '1.0',
  },
}));

describe('Home', () => {
  const services = createTestServices();
  services.archiveLoader.mockBook({ ...book, id: 'some-id', title: 'Should be second' } as any);
  services.archiveLoader.mockBook({ ...book, id: 'some-id-2', title: '0 Should be first' } as any);

  it('matches snapshot and books are sorted', async() => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2021);
    const component = renderer.create(<TestContainer services={services}>
      <Home />
    </TestContainer>);

    // defer promises...
    await new Promise((resolve) => setTimeout(resolve, 1));

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
