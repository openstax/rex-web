import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../test/TestContainer';
import { assertDocument } from '../../../utils/browser-assertions';
import { HTMLTextAreaElement, HTMLDivElement } from '@openstax/types/lib.dom';
import Note, { escapeHandler } from './Note';

describe('Note', () => {
  it('matches snapshot', () => {
    const textarea = assertDocument().createElement('textarea');

    const component = renderer.create(<TestContainer>
      <Note textareaRef={{ current: textarea }} note='' onChange={() => null} edit={true} onFocus={() => null} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onChange', () => {
    const textareaElement = assertDocument().createElement('textarea');

    const onChange = jest.fn();
    const component = renderer.create(<TestContainer>
      <Note textareaRef={{ current: textareaElement }} note='' onChange={onChange} onFocus={() => null} />
    </TestContainer>);

    const textarea = component.root.findByType('textarea');

    renderer.act(() => {
      textarea.props.onChange({
        target: {
          value: 'asdf',
        },
      });
    });

    expect(onChange).toHaveBeenCalledWith('asdf');
  });
  it('handles Escape keydown', () => {
    function Component() {
      const textareaRef = React.useRef<HTMLTextAreaElement>(null);

      return <TestContainer>
        <Note textareaRef={textareaRef} note='' onChange={() => null} onFocus={() => null} />
      </TestContainer>;
    }

    const component = renderer.create(<Component />);
    const textarea = component.root.findByType('textarea');

    // textarea content is undefined, so it will not emit the event
    act(() => {
      textarea.props.onKeyDown({key: 'Escape'});
    });
  });
  it('emits custom event', () => {
    const catcher = jest.fn();
    function Component() {
      const taRef = React.useRef<HTMLTextAreaElement>(null);
      const divRef = React.useRef<HTMLDivElement>(null);

      React.useLayoutEffect(() => {
        divRef.current?.addEventListener('hideCardEvent', catcher);
        escapeHandler(taRef.current, true);
      });

      return (<div ref={divRef}><textarea ref={taRef} /></div>);
    }
    const root = assertDocument().createElement('div');

    act(() => {
      ReactDOM.render(<Component />, root);
    });
    expect(catcher).toHaveBeenCalled();
  });

  it('resizes on update when necessary', () => {
    const textarea = assertDocument().createElement('textarea');
    const textareaRef = {current: textarea};
    const root = assertDocument().createElement('div');

    act(() => {
      ReactDOM.render(<TestContainer>
        <Note textareaRef={textareaRef} note='' onChange={() => null} onFocus={() => null} />
      </TestContainer>, root);
    });

    Object.defineProperty(textareaRef.current, 'scrollHeight', { value: 100 });
    Object.defineProperty(textareaRef.current, 'offsetHeight', { value: 50 });

    act(() => {
      ReactDOM.render(<TestContainer>
        <Note textareaRef={textareaRef} note='asdf' onChange={() => null} onFocus={() => null} />
      </TestContainer>, root);
    });

    expect(textareaRef.current.style.height).toEqual('105px');
  });

  it('doesn\'t resize on update when unneccessary', () => {
    const textarea = assertDocument().createElement('textarea');
    const textareaRef = {current: textarea};
    const root = assertDocument().createElement('div');

    act(() => {
      ReactDOM.render(<TestContainer>
        <Note textareaRef={{ current: textarea }} note='' onChange={() => null} onFocus={() => null} />
      </TestContainer>, root);
    });

    Object.defineProperty(textareaRef.current, 'scrollHeight', { value: 50 });
    Object.defineProperty(textareaRef.current, 'offsetHeight', { value: 50 });

    act(() => {
      ReactDOM.render(<TestContainer>
        <Note textareaRef={{ current: textarea }} note='asdf' onChange={() => null} onFocus={() => null} />
      </TestContainer>, root);
    });

    expect(textareaRef.current.style.height).toEqual('');
  });
});
