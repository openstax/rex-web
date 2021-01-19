import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import Answer from '.';
import { renderToDom } from '../../../../../test/reactutils';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument } from '../../../../utils/browser-assertions';

describe('Answer', () => {
  it('focus answer if it is correct and showCorrect prop is true', () => {
    const container = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(container, 'focus');

    renderer.create(<MessageProvider>
      <Answer
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '1.0' } as any}
        choiceIndicator={'a'}
        onSelect={jest.fn()}
        source={{} as any}
      />
    </MessageProvider>, { createNodeMock: () => container });

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(spyFocus).toHaveBeenCalled();
  });

  it('does not focus answer if it isn\'t correct but showCorrect prop is true', () => {
    const container = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(container, 'focus');

    renderer.create(<MessageProvider>
      <Answer
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '0.0' } as any}
        choiceIndicator={'a'}
        onSelect={jest.fn()}
        source={{} as any}
      />
    </MessageProvider>, { createNodeMock: () => container });

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(spyFocus).not.toHaveBeenCalled();
  });

  it('select answer with a spacebar', () => {
    const onSelect = jest.fn();

    const {node: label} = renderToDom(<MessageProvider>
      <Answer
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '0.0' } as any}
        choiceIndicator={'a'}
        onSelect={onSelect}
        source={{} as any}
      />
    </MessageProvider>);

    label.focus();
    ReactTestUtils.Simulate.keyDown(label, { which: 32 });

    expect(onSelect).toHaveBeenCalled();
  });

  it('do not select answer for other keys', () => {
    const onSelect = jest.fn();

    const {node: label} = renderToDom(<MessageProvider>
      <Answer
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '0.0' } as any}
        choiceIndicator={'a'}
        onSelect={onSelect}
        source={{} as any}
      />
    </MessageProvider>);

    label.focus();
    ReactTestUtils.Simulate.keyDown(label, { which: 13 });
    ReactTestUtils.Simulate.keyDown(label, { which: 33 });
    ReactTestUtils.Simulate.keyDown(label, { which: 36 });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
