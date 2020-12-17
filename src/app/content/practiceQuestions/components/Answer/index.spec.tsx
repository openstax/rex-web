import React from 'react';
import renderer from 'react-test-renderer';
import Answer from '.';
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
});
