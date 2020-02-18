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
        subheading='i18n:discard:body'
        footer={null}
      />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
