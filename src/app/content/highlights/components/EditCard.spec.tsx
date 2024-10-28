import { Highlight } from '@openstax/highlighter';
import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React, { ReactElement } from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { makeFindByTestId } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import * as selectAuth from '../../../auth/selectors';
import { formatUser } from '../../../auth/utils';
import { assertDocument } from '../../../utils';
import { highlightStyles } from '../../constants';
import { updateHighlight } from '../actions';
import ColorPicker from './ColorPicker';
import EditCard, { EditCardProps } from './EditCard';
import Note from './Note';
import * as onClickOutsideModule from './utils/onClickOutside';
import { MAIN_CONTENT_ID } from '../../../context/constants';
import { renderToDom } from '../../../../test/reactutils';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker="true" data-props={props} />);
jest.mock('./Note', () => (props: any) => <div mock-note="true" data-props={props} ref={props.textareaRef} />);
jest.mock('./Confirmation', () => (props: any) => <div mock-confirmation="true" data-props={props} />);

describe('EditCard', () => {
  const highlight = createMockHighlight('asdf');
  const highlightData = highlight.serialize().data;
  const store = createTestStore();
  const dispatch = jest.spyOn(store, 'dispatch');
  const services = {
    ...createTestServices(),
    dispatch: store.dispatch,
    getState: store.getState,
  };
  let editCardProps: Partial<EditCardProps>;

  beforeEach(() => {
    jest.resetAllMocks();
    highlight.elements = [assertDocument().createElement('span')];
    editCardProps = {
      isActive: true,
      highlight: highlight as unknown as Highlight,
      onBlur: jest.fn(),
      onCancel: jest.fn(),
      onCreate: jest.fn(),
      onRemove: jest.fn(),
      setAnnotationChangesPending: jest.fn(),
    };
  });

  it('matches snapshot when focused', () => {
    const data = {
      color: highlightStyles[0].label,
      ...highlightData,
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} data={data} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with data', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    mockSpyUser.mockClear();
  });

  it('matches snapshot when editing', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          isActive={true}
        />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    mockSpyUser.mockClear();
  });

  it('matches snapshot without data', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('chains ColorPicker onRemove', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={data}
        />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a note', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'asdf',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
            <EditCard {...editCardProps} data={data} isActive={true} />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a pending note', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('cancelling resets the form state', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
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
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
    mockSpyUser.mockClear();
  });

  it('save saves', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
          onCreate={jest.fn()}
        />
      </TestContainer>
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

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {color: highlightData.style as any, annotation: 'asdf'},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: highlightData.annotation,
          color: highlightData.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
    expect(editCardProps.onCancel).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('removing note shows confirmation', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
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
    mockSpyUser.mockClear();
  });

  it('confirmation can save', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
          data={data}
        />
      </TestContainer>
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
    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {color: highlightData.style as any, annotation: ''},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: data.annotation,
          color: data.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(editCardProps.onCancel).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('confirmation can cancel', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
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
    expect(dispatch).not.toHaveBeenCalled();
    expect(note.props.note).toBe('qwer');
    mockSpyUser.mockClear();
  });

  it('responds to changes', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
          hasUnsavedHighlight={false}
        />
      </TestContainer>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('');
    });
    expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(true);
    mockSpyUser.mockClear();
  });

  it('dispatches if changes are reverted', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
          hasUnsavedHighlight={true}
        />
      </TestContainer>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('qwer');
    });
    expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(false);
    mockSpyUser.mockClear();
  });

  it('handles color change when there is data', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
        />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(store.dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {annotation: highlightData.annotation, color: 'blue' as any},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: highlightData.annotation,
          color: highlightData.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
    mockSpyUser.mockClear();
  });

  it('creates when changing color on a new highlight', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(editCardProps.onCreate).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('sets color and creates when you focus', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).toHaveBeenCalledWith(highlightStyles[0].label);
    expect(editCardProps.onCreate).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('focusing an existing note does nothing', () => {
    highlight.getStyle.mockReturnValue('red');
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} data={highlightData} />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).not.toHaveBeenCalled();
    expect(editCardProps.onCreate).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('blurs when clicking outside', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'useOnClickOutside');
    onClickOutside.mockReturnValue();

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    onClickOutside.mock.calls[0][2]({} as any);

    expect(component).toBeTruthy();
    expect(onClickOutside.mock.calls.length).toBe(1);
    expect(editCardProps.onBlur).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('blurs and removes selections when navigating to different elements', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onHeightChange = jest.fn();

    renderToDom(
      <div id={MAIN_CONTENT_ID} tabIndex={-1}>
        <TestContainer services={services} store={store}>
          <a href='#foo'>text</a>
          <EditCard
            {...{...editCardProps, hasUnsavedHighlight: false}}
            onHeightChange={onHeightChange}
            isActive={true}
          />
        </TestContainer>
      </div>
    );

    document?.getElementById(MAIN_CONTENT_ID)?.focus();
    document?.querySelector('a')?.focus();
    document?.getElementById(MAIN_CONTENT_ID)?.focus();
    expect(editCardProps.onBlur).toHaveBeenCalledTimes(1);
    mockSpyUser.mockClear();
    jest.resetAllMocks();
  });

  it('doesn\'t blur when there is data (existing highlight)', () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onHeightChange = jest.fn();
    const data = {
      color: highlightStyles[0].label,
      ...highlightData,
    };

    renderToDom(
      <div id={MAIN_CONTENT_ID} tabIndex={-1}>
        <TestContainer services={services} store={store}>
          <a href='#foo'>text</a>
          <EditCard
            {...{
              ...editCardProps,
              hasUnsavedHighlight: false,
            }}
            data={data}
            onHeightChange={onHeightChange}
            isActive={true}
          />
        </TestContainer>
      </div>
    );

    document?.getElementById(MAIN_CONTENT_ID)?.focus();
    document?.querySelector('a')?.focus();
    document?.getElementById(MAIN_CONTENT_ID)?.focus();
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('doesn\'t blur when clicking outside and editing', () => {
    highlight.getStyle.mockReturnValue('red');

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'useOnClickOutside');
    onClickOutside.mockReturnValue();

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={highlightData}
          hasUnsavedHighlight={true}
        />
      </TestContainer>
    );

    renderer.act(() => undefined);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    onClickOutside.mock.calls[1][2]({} as any);

    expect(onClickOutside.mock.calls.length).toBe(2);
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(editCardProps.onCancel).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('trackShowCreate for authenticated user', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));

    const spyAnalytics = jest.spyOn(services.analytics.showCreate, 'track');

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={undefined}
        />
      </TestContainer>
    );

    expect(spyAnalytics).not.toHaveBeenCalled();

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(() => component.root.findByProps({
      'data-analytics-region': 'highlighting-login',
    })).toThrow();
    expect(spyAnalytics).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('does not trackShowCreate for authenticated user if the card is not active', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));

    const spyAnalytics = jest.spyOn(services.analytics.showCreate, 'track');

    renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={false}
          data={undefined}
        />
      </TestContainer>
    );

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(spyAnalytics).not.toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('does not trackShowLogin for unauthenticated user if the card is not active', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const spyAnalytics = jest.spyOn(services.analytics.showLogin, 'track');

    renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={false}
          data={undefined}
        />
      </TestContainer>
    );

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(spyAnalytics).not.toHaveBeenCalled();
  });

  it('call onHeightChange when element mounts', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onHeightChange = jest.fn();
    const createNodeMock = () => assertDocument().createElement('div');

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          onHeightChange={onHeightChange}
        />
      </TestContainer>,
      {createNodeMock}
    );

    expect(onHeightChange).not.toHaveBeenCalled();

    // Wait for mount
    renderer.act(() => undefined);

    expect(() => component.root.findByProps({
      'data-analytics-region': 'edit-note',
    })).not.toThrow();
    expect(onHeightChange).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('focuses textarea if shouldFocusCard is set to true', () => {
    const editCard = assertDocument().createElement('div');
    const textarea = assertDocument().createElement('textarea');

    const spyTextareaFocus = jest.spyOn(textarea, 'focus');

    const createNodeMock = (element: ReactElement) => {
      if (element.type === 'form') {
        return editCard;
      } else {
        return textarea;
      }
    };

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    const onHeightChange = jest.fn();

    renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} onHeightChange={onHeightChange} shouldFocusCard={true} />
      </TestContainer>,
      {createNodeMock}
    );

    // Wait for hooks
    renderer.act(() => undefined);

    expect(spyTextareaFocus).toHaveBeenCalledTimes(1);
    mockSpyUser.mockClear();
  });
});
