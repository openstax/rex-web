import React from 'react';
import renderer from 'react-test-renderer';
import ProgressBar from '.';
import ProgressBarItem from './ProgressBarItem';

describe('ProgressBar', () => {
  it('displays properly', () => {
    const component = renderer.create(<ProgressBar total={3} activeIndex={1} />);

    const [item1, item2, item3] = component.root.findAllByType(ProgressBarItem);

    expect(item1.props.isActive).toEqual(false);
    expect(item1.props.isDisabled).toEqual(false);

    expect(item2.props.isActive).toEqual(true);
    expect(item2.props.isDisabled).toEqual(false);

    expect(item3.props.isActive).toEqual(false);
    expect(item3.props.isDisabled).toEqual(true);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
