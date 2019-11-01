import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../../MessageProvider';
import TruncatedText from './TruncatedText';

describe('TruncatedText', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider onError={() => null}>
      <TruncatedText text='asdf' isFocused={false} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<MessageProvider onError={() => null}>
      <TruncatedText text='asdf' isFocused={true} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows link', async() => {
    const createNodeMock = () => ({
      offsetHeight: 50,
      scrollHeight: 100,
    });
    const component = renderer.create(<MessageProvider onError={() => null}>
      <TruncatedText text='asdf' isFocused={true} />
    </MessageProvider>, {createNodeMock});

    component.update(<MessageProvider onError={() => null}>
      <TruncatedText text='asdf' isFocused={true} />
    </MessageProvider>);

    expect(() => component.root.findByType('span')).not.toThrow();
  });
});
