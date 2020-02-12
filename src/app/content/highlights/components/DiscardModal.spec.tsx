import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../../MessageProvider';
import DiscardModal from './DiscardModal';

describe('ErrorModal', () => {
  let onAnswer: jest.Mock;

  beforeEach(() => {
    onAnswer = jest.fn();
  });

  it('matches snapshot', () => {
    const tree = renderer
      .create(<MessageProvider><DiscardModal onAnswer={() => null} /></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('cancels discard', () => {
    const tree = renderer.create(<MessageProvider><DiscardModal onAnswer={onAnswer} /></MessageProvider>);

    const btn = tree.root.findByProps({ 'data-testid': 'cancel-discard' });
    renderer.act(() => { btn.props.onClick(); });
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('confirms discard', () => {
    const tree = renderer.create(<MessageProvider><DiscardModal onAnswer={onAnswer} /></MessageProvider>);

    const btn = tree.root.findByProps({ 'data-testid': 'discard-changes' });
    renderer.act(() => { btn.props.onClick(); });
    expect(onAnswer).toHaveBeenCalledWith(true);
  });
});
