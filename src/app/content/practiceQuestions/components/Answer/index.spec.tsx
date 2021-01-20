import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import Answer from '.';
import { renderToDom } from '../../../../../test/reactutils';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument } from '../../../../utils/browser-assertions';
import { PracticeQuestion } from '../../types';

const mockQuestion = {
  answers: [
    {
      content_html: '<span data-math=\'25\'>25</span>',
      correctness: '0.0',
      feedback_html: '...',
      id: 273729,
    },
    {
      content_html: '<span data-math=\'26\'>26</span>',
      correctness: '1.0',
      feedback_html: 'Iron is most strongly bound nuclide.',
      id: 273730,
    },
  ],
  group_uuid: 'd95384f2-1330-4582-9d81-1af0eae17b48',
  stem_html: 'What is the atomic number of the most strongly bound nuclide?',
  tags: 'd95384f2-1330-4582-9d81-1af0eae17b48',
  uid: '11591@5',
} as PracticeQuestion;

describe('Answer', () => {
  it('focus answer if it is correct and showCorrect prop is true', () => {
    const container = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(container, 'focus');

    renderer.create(<MessageProvider>
      <Answer
        question={mockQuestion}
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
        question={mockQuestion}
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
        question={mockQuestion}
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
        question={mockQuestion}
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
