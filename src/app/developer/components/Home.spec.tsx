import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
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
  const store = createTestStore();
  const services = {
    ...createTestServices(),
    dispatch: store.dispatch,
    getState: store.getState,
  };
  services.archiveLoader.mockBook({ ...book, id: 'some-id', title: 'booktitle' } as any);
  services.archiveLoader.mockBook({ ...book, id: 'some-id-2', title: 'booktitle2' } as any);

  it('matches snapshot', async() => {
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
