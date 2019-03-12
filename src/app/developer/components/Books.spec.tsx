import React from 'react';
import renderer from 'react-test-renderer';
import mockArchiveLoader from '../../../test/mocks/archiveLoader';
import mockOSWebLoader from '../../../test/mocks/osWebLoader';
import * as Services from '../../context/Services';
import { AppServices } from '../../types';
import Books from './Books';

describe('Routes', () => {
  let archiveLoader: AppServices['archiveLoader'];
  let osWebLoader: AppServices['osWebLoader'];
  const services = {} as AppServices;

  beforeEach(() => {
    archiveLoader = mockArchiveLoader();
    osWebLoader = mockOSWebLoader();
    (services as any).archiveLoader = archiveLoader;
    (services as any).osWebLoader = osWebLoader;
  });

  it('matches snapshot', async() => {
    const component = renderer.create(<Services.Provider value={services}>
      <Books />
    </Services.Provider>);

    // defer promises...
    await new Promise((resolve) => setTimeout(resolve, 1));

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
