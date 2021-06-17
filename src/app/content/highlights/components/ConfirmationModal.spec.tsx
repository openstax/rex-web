import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import TestContainer from '../../../../test/TestContainer';
import { Store } from '../../../types';
import { showConfirmationModal } from '../../actions';
import Confirmation from './ConfirmationModal';

describe('ConfirmationModal', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('does not render if is not set to be opened', () => {
    const component = renderer.create(<TestContainer store={store}>
      <Confirmation/>
    </TestContainer>);

    expect(component.toJSON()).toBe(null);
  });

  it('matches snapshot', () => {
    store.dispatch(showConfirmationModal({
      options: {
        bodyi18nKey: 'asd',
        callback: (confirmed: boolean) => confirmed,
        cancelButtoni18nKey: 'asd',
        headingi18nKey: 'asd',
        okButtoni18nKey: 'asd',
      },
    }));

    const component = renderer.create(<TestContainer store={store}>
      <Confirmation/>
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
