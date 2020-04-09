import React from 'react';
import renderer from 'react-test-renderer';
import Modal from '.';
import MessageProvider from '../../MessageProvider';

describe('Modal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const component = renderer.create(<MessageProvider>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      >
        <div>child 1</div>
        <div>child 2</div>
      </Modal>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
