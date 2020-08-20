
import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../../../MessageProvider';
import UsingThisGuideBanner from './UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuideButton';

describe('Using this guide', () => {
  const onclickFn = jest.fn();

  it('renders using this guide button correctly (when banner closed)', () => {
    const component = renderer.create(
      <MessageProvider>
        <UsingThisGuideButton open={false} onClick={onclickFn}/>
      </MessageProvider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide button correctly (when banner open)', () => {
    const component = renderer.create(
      <MessageProvider>
        <UsingThisGuideButton open={true} onClick={onclickFn}/>
      </MessageProvider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide banner correctly', () => {
    const component = renderer.create(
      <MessageProvider>
        <UsingThisGuideBanner onClick={onclickFn}/>
      </MessageProvider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
