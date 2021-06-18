import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import TestContainer from '../../../../../test/TestContainer';
import { Store } from '../../../../types';
import ConfirmationModal from '../ConfirmationModal';
import showDiscardChangesConfirmation from './showDiscardChangesConfirmation';

describe('showDiscardChangesConfirmation', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', async() => {
    showDiscardChangesConfirmation(store.dispatch);
    const component = renderer.create(<TestContainer store={store}>
      <ConfirmationModal/>
    </TestContainer>);
    expect(component.toJSON()).toMatchSnapshot();

    await Promise.resolve();
  });

  it('returns true on confirmation', async() => {
    const answer = showDiscardChangesConfirmation(store.dispatch);
    const component = renderer.create(<TestContainer store={store}>
      <ConfirmationModal/>
    </TestContainer>);

    const okButton = component.root.findByProps({ 'data-test-id': 'confirmation-modal-ok-button' });
    renderer.act(() => {
      okButton.props.onClick();
    });

    expect(await answer).toBe(true);
  });

  it('returns false on denial', async() => {
    const answer = showDiscardChangesConfirmation(store.dispatch);
    const component = renderer.create(<TestContainer store={store}>
      <ConfirmationModal/>
    </TestContainer>);

    const cancelButton = component.root.findByProps({ 'data-test-id': 'confirmation-modal-cancel-button' });
    renderer.act(() => {
      cancelButton.props.onClick();
    });

    expect(await answer).toBe(false);
  });

  it('returns false on exit', async() => {
    const answer = showDiscardChangesConfirmation(store.dispatch);
    const component = renderer.create(<TestContainer store={store}>
      <ConfirmationModal/>
    </TestContainer>);

    const modal = component.root.findByProps({ 'data-test-id': 'confirmation-modal' });
    renderer.act(() => {
      modal.props.onModalClose();
    });

    expect(await answer).toBe(false);
  });
});
