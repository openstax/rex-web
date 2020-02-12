import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { makeFindByTestId } from '../../../../test/reactutils';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { assertDocument } from '../../../utils';
import { highlightStyles } from '../constants';
import ColorPicker from './ColorPicker';
import EditCard from './EditCard';
import Note from './Note';
import * as onClickOutsideModule from './utils/onClickOutside';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./Note', () => (props: any) => <div mock-note {...props} />);
jest.mock('./Confirmation', () => (props: any) => <div mock-confirmation {...props} />);

describe('EditCard', () => {
  const highlight = createMockHighlight('asdf');
  const highlightData = highlight.serialize().data;
  const services = createTestServices();
  const store = createTestStore();
  const setAnnotationChangesPending = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    highlight.elements = [assertDocument().createElement('span')];
  });

  it('matches snapshot when focused', () => {
    const data = {
      color: highlightStyles[0].label,
      ...highlightData,
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with data', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when editing', () => {
    highlight.getStyle.mockReturnValue('red');
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={highlightData}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard highlight={highlight as unknown as Highlight} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('chains ColorPicker onRemove', () => {
    const onRemove = jest.fn();
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onRemove={onRemove}
              isFocused={true}
              data={data}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a note', () => {
    const onRemove = jest.fn();
    const data = {
      ...highlightData,
      annotation: 'asdf',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onRemove={onRemove}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a pending note', () => {
    const onRemove = jest.fn();
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onRemove={onRemove}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('cancelling resets the form state', () => {
    const blur = jest.fn();
    const onRemove = jest.fn();
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onRemove={onRemove}
              onCancel={() => null}
              onBlur={blur}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    expect(component.root.findAllByType('button').length).toBe(2);
    expect(note.props.note).toBe('asdf');

    const cancel = findByTestId('cancel');
    renderer.act(() => {
      cancel.props.onClick({preventDefault: jest.fn()});
    });

    expect(note.props.note).toBe('qwer');
    expect(blur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
  });

  it('save saves', () => {
    const blur = jest.fn();
    const save = jest.fn();
    const cancel = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              data={highlightData}
              locationFilterId='locationId'
              pageId='pageId'
              onCancel={cancel}
              onSave={save}
              setAnnotationChangesPending={setAnnotationChangesPending}
              onBlur={blur}
              isFocused={true}
              onCreate={jest.fn()}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    expect(save).toHaveBeenCalledWith({
      highlight: {color: highlightData.style, annotation: 'asdf'},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
    });
    expect(blur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
    expect(cancel).toHaveBeenCalled();
  });

  it('removing note shows confirmation', () => {
    const save = jest.fn();
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onSave={save}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    expect(() => findByTestId('confirm-delete')).not.toThrow();
  });

  it('confirmation can save', () => {
    const save = jest.fn();
    const cancel = jest.fn();
    const blur = jest.fn();
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              locationFilterId='locationId'
              pageId='pageId'
              onSave={save}
              onCancel={cancel}
              isFocused={true}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              onBlur={blur}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    const confirmation = findByTestId('confirm-delete');
    renderer.act(() => {
      confirmation.props.onConfirm();
      confirmation.props.always();
    });

    expect(() => findByTestId('confirm-delete')).toThrow();
    expect(save).toHaveBeenCalledWith({
      highlight: {color: highlightData.style, annotation: ''},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
    });
    expect(blur).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
  });

  it('confirmation can cancel', () => {
    const save = jest.fn();
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onSave={save}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    const confirmation = findByTestId('confirm-delete');
    renderer.act(() => {
      confirmation.props.onCancel();
      confirmation.props.always();
    });

    expect(() => findByTestId('confirm-delete')).toThrow();
    expect(save).not.toHaveBeenCalled();
    expect(note.props.note).toBe('qwer');
  });

  it('responds to changes', () => {
    const save = jest.fn();
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onSave={save}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
              hasUnsavedHighlight={false}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('');
    });
    expect(setAnnotationChangesPending).toHaveBeenCalledWith(true);
  });

  it('dispatches if changes are reverted', () => {
    const save = jest.fn();
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onSave={save}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={data}
              isFocused={true}
              hasUnsavedHighlight={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('qwer');
    });
    expect(setAnnotationChangesPending).toHaveBeenCalledWith(false);
  });

  it('handles color change when there is data', () => {
    const save = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              data={highlightData}
              locationFilterId='locationId'
              pageId='pageId'
              onSave={save}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(save).toHaveBeenCalledWith({
      highlight: {annotation: highlightData.annotation, color: 'blue'},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
    });
  });

  it('creates when changing color on a new highlight', () => {
    const create = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onCreate={create}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(create).toHaveBeenCalled();
  });

  it('sets color and creates when you focus', () => {
    const create = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onCreate={create}
              authenticated={true}
              onCancel={() => null}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).toHaveBeenCalledWith(highlightStyles[0].label);
    expect(create).toHaveBeenCalled();
  });

  it('focusing an existing note does nothing', () => {
    highlight.getStyle.mockReturnValue('red');
    const create = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              data={highlightData}
              authenticated={true}
              onCancel={() => null}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('blurs when clicking outside', () => {
    const onBlur = jest.fn();

    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onBlur={onBlur}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    onClickOutside.mock.calls[0][2]();

    expect(component).toBeTruthy();
    expect(onClickOutside.mock.calls.length).toBe(1);
    expect(onBlur).toHaveBeenCalled();
  });

  it('doesn\'t blur when clicking outside and editing', () => {
    const onBlur = jest.fn();
    const onCancel = jest.fn();
    highlight.getStyle.mockReturnValue('red');

    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              highlight={highlight as unknown as Highlight}
              onBlur={onBlur}
              isFocused={true}
              setAnnotationChangesPending={setAnnotationChangesPending}
              data={highlightData}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    onClickOutside.mock.calls[1][2]();

    expect(onClickOutside.mock.calls.length).toBe(2);
    expect(onBlur).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
