import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../test/TestContainer';
import TruncatedText from './TruncatedText';

function Component({isActive, onChange = () => undefined}: {isActive: boolean; onChange?: () => void }) {
  return <TestContainer>
      <TruncatedText id='1' text='asdf' isActive={isActive} onChange={onChange} />
    </TestContainer>
}

describe('TruncatedText', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Component isActive={false} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<Component isActive={true} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows link', async() => {
    const createNodeMock = () => ({
      offsetHeight: 50,
      scrollHeight: 100,
    });

    const component = renderer.create(<Component isActive={true} />, {createNodeMock});

    component.update(<Component isActive={true} />);

    expect(() => component.root.findByType('span')).not.toThrow();
  });

  it('calls onChange when state changes', () => {
    const onChange = jest.fn();

    renderer.create(<Component isActive={false} onChange={onChange} />);

    renderer.create(<Component isActive={true} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
