import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../MessageProvider';
import Modal from './Modal';

describe('Modal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Modal
        onModalClose={() => null}
        footer={null}
        body={null}
        headerTextId='i18n:discard:heading'
        bodyTextId='i18n:discard:body'
      />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
