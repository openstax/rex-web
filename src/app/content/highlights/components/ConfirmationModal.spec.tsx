import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import Confirmation from './ConfirmationModal';

describe('ConfirmationModal', () => {
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
      services = createTestServices();
    });

  it('matches snapshot', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Confirmation
          confirm={() => null}
          deny={() => null}
        />
      </MessageProvider>
    </Services.Provider>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
