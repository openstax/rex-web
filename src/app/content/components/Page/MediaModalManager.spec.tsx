import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ReactDOM from 'react-dom';
import { mediaModalManager, MediaModalPortal } from './MediaModalManager';

describe('MediaModalPortal', () => {
  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element) => element) as any;
  });

  it('does not render initially', () => {
    const tree = renderer.create(<MediaModalPortal />).toJSON();
    expect(tree).toBeNull();
  });

  it('renders content when opened via modal manager', () => {
    const wrapper = renderer.create(<MediaModalPortal />);

    act(() => {
      mediaModalManager.open(<div>Test modal content</div>);
    });

    const tree = wrapper.toJSON();
    expect(tree).toMatchSnapshot();
  });

//   it('closes modal on close button click', () => {
//     const wrapper = renderer.create(<MediaModalPortal />);

//     act(() => {
//       mediaModalManager.open(<div>Close me</div>);
//     });

//     const button = wrapper.root.findAllByType('button')[0];
//     act(() => {
//       button.props.onClick();
//     });

//     expect(wrapper.toJSON()).toBeNull();
//   });
});
