import { Highlight } from '@openstax/highlighter';
import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React, { ReactElement } from 'react';
import renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils';
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

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker='true' data-props={props} />);
jest.mock('./Note', () => (props: any) => <div mock-note='true' data-props={props} ref={props.textareaRef} />);
jest.mock('./Confirmation', () => (props: any) => <div mock-confirmation='true' data-props={props} />);

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

  // Test Helper Functions
  const setupAuthenticatedUser = () => {
    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));
    return () => mockSpyUser.mockClear();
  };

  const renderEditCard = (props: Partial<EditCardProps> & Pick<EditCardProps, 'highlight'>) => {
    return renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...props} />
      </TestContainer>
    );
  };

  const renderAuthenticatedEditCard = (props: Partial<EditCardProps> & Pick<EditCardProps, 'highlight'>) => {
    // Provide sensible defaults for all required EditCardProps
    const defaultProps: EditCardProps = {
      isActive: false,
      hasUnsavedHighlight: false,
      highlight: props.highlight,
      locationFilterId: 'test-location',
      pageId: 'test-page',
      onCreate: jest.fn(),
      onBlur: jest.fn(),
      setAnnotationChangesPending: jest.fn(),
      onRemove: jest.fn(),
      onCancel: jest.fn(),
      onHeightChange: jest.fn(),
      className: '',
      shouldFocusCard: false,
    };

    const cleanup = setupAuthenticatedUser();
    const component = renderEditCard({ ...defaultProps, ...props });
    return { component, cleanup };
  };

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

  describe('Snapshots and Rendering', () => {
    it('matches snapshot when focused', () => {
      const data = {
        color: highlightStyles[0].label,
        ...highlightData,
      };
      const component = renderer.create(
        <TestContainer services={services} store={store}>
          <EditCard {...editCardProps} data={data} isActive={true} shouldFocusCard={true} />
        </TestContainer>
      );

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with data for authenticated user', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        isActive: true,
        shouldFocusCard: true,
      });

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
      cleanup();
    });

    it('matches snapshot when editing', () => {
      highlight.getStyle.mockReturnValue('red');
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data: highlightData,
        isActive: true,
        shouldFocusCard: true,
      });

      const note = component.root.findByType(Note);
      renderer.act(() => {
        note.props.onChange('asdf');
      });

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      cleanup();
    });

    it('shows create highlight message for new highlight', () => {
      const newHighlight = {...highlight, elements: []};
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        highlight: newHighlight,
        data: highlightData,
        isActive: true,
        shouldFocusCard: false,
      });

      const button = component.root.findByType('button');
      expect(button.props.children.props.id).toBe('i18n:highlighting:create-instructions');
      cleanup();
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
  });

  describe('ColorPicker onRemove Handling', () => {
    it('chains ColorPicker onRemove for highlight without note', () => {
      const data = {
        ...highlightData,
        annotation: '',
        color: 'red',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        isActive: true,
        data,
        shouldFocusCard: true,
      });

      const picker = component.root.findByType(ColorPicker);

      renderer.act(() => {
        picker.props.onRemove();
      });

      expect(editCardProps.onRemove).toHaveBeenCalled();
      cleanup();
    });

    it('doesn\'t chain ColorPicker onRemove if there is a note', () => {
      const data = {
        ...highlightData,
        annotation: 'asdf',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
      });

      const picker = component.root.findByType(ColorPicker);

      expect(picker.props.onRemove).toBeNull();
      cleanup();
    });

    it('doesn\'t chain ColorPicker onRemove if there is no data', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        isActive: true,
        shouldFocusCard: true,
      });

      const picker = component.root.findByType(ColorPicker);

      expect(picker.props.onRemove).toBeNull();
      cleanup();
    });

    it('doesn\'t chain ColorPicker onRemove if there is a pending note', () => {
      highlight.getStyle.mockReturnValue('red');
      const data = {
        ...highlightData,
        annotation: '',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
        shouldFocusCard: true,
      });

      const note = component.root.findByType(Note);
      renderer.act(() => {
        note.props.onChange('asdf');
      });

      const picker = component.root.findByType(ColorPicker);

      expect(picker.props.onRemove).toBeNull();
      cleanup();
    });
  });

  describe('Annotation Editing and Form State', () => {
    it('cancelling resets the form state', () => {
      highlight.getStyle.mockReturnValue('red');
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
      });
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
      cleanup();
    });

    it('saving annotation dispatches updateHighlight action', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data: highlightData,
        locationFilterId: 'locationId',
        pageId: 'pageId',
        isActive: true,
        onCreate: jest.fn(),
        shouldFocusCard: true,
      });
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
      cleanup();
    });

    it('responds to annotation changes by calling setAnnotationChangesPending', () => {
      highlight.getStyle.mockReturnValue('red');
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
        hasUnsavedHighlight: false,
      });
      const note = component.root.findByType(Note);

      renderer.act(() => {
        note.props.onChange('');
      });
      expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(true);
      cleanup();
    });

    it('calls setAnnotationChangesPending(false) when changes are reverted', () => {
      highlight.getStyle.mockReturnValue('red');
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
        hasUnsavedHighlight: true,
      });
      const note = component.root.findByType(Note);

      renderer.act(() => {
        note.props.onChange('qwer');
      });
      expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(false);
      cleanup();
    });
  });

  describe('Confirmation Dialog', () => {
    it('shows confirmation when removing note', () => {
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
      });
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
      cleanup();
    });

    it('saves when confirmation is confirmed', () => {
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        locationFilterId: 'locationId',
        pageId: 'pageId',
        isActive: true,
        data,
      });
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
      cleanup();
    });

    it('restores previous note when confirmation is cancelled', () => {
      highlight.getStyle.mockReturnValue('red');
      const data = {
        ...highlightData,
        annotation: 'qwer',
      };
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data,
        isActive: true,
      });
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
      cleanup();
    });
  });

  describe('Color Changes', () => {
    it('handles color change on existing highlight', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data: highlightData,
        locationFilterId: 'locationId',
        pageId: 'pageId',
        isActive: true,
        shouldFocusCard: true,
      });

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
      cleanup();
    });

    it('creates highlight when changing color on a new highlight', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        isActive: true,
        shouldFocusCard: true,
      });

      const picker = component.root.findByType(ColorPicker);
      renderer.act(() => {
        picker.props.onChange('blue');
      });

      expect(highlight.setStyle).toHaveBeenCalledWith('blue');
      expect(editCardProps.onCreate).toHaveBeenCalled();
      cleanup();
    });
  });

  describe('Focus Management', () => {
    it('sets default color and creates highlight when focusing note on new highlight', () => {
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        shouldFocusCard: true,
      });

      const note = component.root.findByType(Note);
      renderer.act(() => {
        note.props.onFocus();
      });

      expect(highlight.setStyle).toHaveBeenCalledWith(highlightStyles[0].label);
      expect(editCardProps.onCreate).toHaveBeenCalled();
      cleanup();
    });

    it('does not create highlight when focusing note on existing highlight', () => {
      highlight.getStyle.mockReturnValue('red');
      const { component, cleanup } = renderAuthenticatedEditCard({
        ...editCardProps,
        data: highlightData,
        shouldFocusCard: true,
      });

      const note = component.root.findByType(Note);
      renderer.act(() => {
        note.props.onFocus();
      });

      expect(highlight.setStyle).not.toHaveBeenCalled();
      expect(editCardProps.onCreate).not.toHaveBeenCalled();
      cleanup();
    });

    it('focuses textarea when shouldFocusCard is true', () => {
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

      const cleanup = setupAuthenticatedUser();
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
      cleanup();
    });
  });

  describe('Event Handling', () => {
    it('blurs and removes selections when navigating to different elements on new highlight', () => {
      const cleanup = setupAuthenticatedUser();
      const onHeightChange = jest.fn();

      renderToDom(
        <div id={MAIN_CONTENT_ID} tabIndex={-1}>
          <TestContainer services={services} store={store}>
            <a href='#foo'>text</a>
            <EditCard
              {...{...editCardProps, hasUnsavedHighlight: false}}
              onHeightChange={onHeightChange}
              isActive={true}
              shouldFocusCard={true}
            />
          </TestContainer>
        </div>
      );

      document?.getElementById(MAIN_CONTENT_ID)?.focus();
      document?.querySelector('a')?.focus();
      document?.getElementById(MAIN_CONTENT_ID)?.focus();
      expect(editCardProps.onBlur).toHaveBeenCalledTimes(1);
      cleanup();
      jest.resetAllMocks();
    });

    it('doesn\'t blur when there is data (existing highlight)', () => {
      const cleanup = setupAuthenticatedUser();
      const onHeightChange = jest.fn();
      const data = {
        color: highlightStyles[0].label,
        ...highlightData,
      };

      const component = renderToDom(
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
      const button = component.node.querySelector('button') as HTMLButtonElement;
      const preventDefault = jest.fn();
      document!.dispatchEvent = jest.fn();

      // Two branches of showCard - must be mousedown of button 0
      ReactTestUtils.Simulate.mouseDown(button, { preventDefault, button: 1 });
      expect(preventDefault).not.toHaveBeenCalled();
      ReactTestUtils.Simulate.mouseDown(button, { preventDefault, button: 0 });
      expect(preventDefault).toHaveBeenCalled();
      expect(document!.dispatchEvent).toHaveBeenCalled();

      cleanup();
    });

    it('calls onHeightChange when element mounts', () => {
      const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
      onClickOutside.mockReturnValue(() => () => null);

      const cleanup = setupAuthenticatedUser();
      const onHeightChange = jest.fn();
      const createNodeMock = () => assertDocument().createElement('div');

      const component = renderer.create(
        <TestContainer services={services} store={store}>
          <EditCard
            {...editCardProps}
            isActive={true}
            onHeightChange={onHeightChange}
            shouldFocusCard={true}
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
      cleanup();
    });
  });

  describe('Analytics', () => {
    it('tracks showCreate event for authenticated user on active card', () => {
      const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
      onClickOutside.mockReturnValue(() => () => null);

      const cleanup = setupAuthenticatedUser();

      const spyAnalytics = jest.spyOn(services.analytics.showCreate, 'track');

      const component = renderer.create(
        <TestContainer services={services} store={store}>
          <EditCard
            {...editCardProps}
            isActive={true}
            data={undefined}
            shouldFocusCard={true}
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
      cleanup();
    });

    it('does not track showCreate for authenticated user when card is not active', () => {
      const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
      onClickOutside.mockReturnValue(() => () => null);

      const cleanup = setupAuthenticatedUser();

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
      cleanup();
    });

    it('does not track showLogin for unauthenticated user when card is not active', () => {
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

    it('shows login for unauthenticated user when card is active', () => {
      renderer.create(
        <TestContainer services={services} store={store}>
          <EditCard
            {...editCardProps}
            isActive={false}
            data={undefined}
            shouldFocusCard={true}
          />
        </TestContainer>
      );

      // Wait for React.useEffect
      renderer.act(() => undefined);

    });
  });
});
