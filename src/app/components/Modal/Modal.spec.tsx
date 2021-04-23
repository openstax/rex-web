import React from 'react';
import renderer from 'react-test-renderer';
import Modal from '.';
import createTestServices from '../../../test/createTestServices';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';

describe('Modal', () => {
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
      services = createTestServices();
    });

  it('matches snapshot', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Modal
          onModalClose={() => null}
          heading='i18n:discard:heading'
        />
      </MessageProvider>
    </Services.Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Modal
          onModalClose={() => null}
          heading='i18n:discard:heading'
        >
          <div>child 1</div>
          <div>child 2</div>
        </Modal>
      </MessageProvider>
    </Services.Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
