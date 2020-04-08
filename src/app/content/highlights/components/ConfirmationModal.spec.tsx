import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../../MessageProvider';
import Confirmation from './ConfirmationModal';

describe('ConfirmationModal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Confirmation
        confirm={() => null}
        deny={() => null}
      />
    </MessageProvider>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
