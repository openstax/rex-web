import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement, HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import * as selectAuth from '../../../auth/selectors';
import Button, { ButtonGroup } from '../../../components/Button';
import { useFocusElement, useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertDefined, assertWindow, mergeRefs } from '../../../utils';
import { highlightStyles } from '../../constants';
import {
  clearFocusedHighlight,
  setAnnotationChangesPending as setAnnotationChangesPendingAction,
  updateHighlight
} from '../actions';
import { cardPadding } from '../constants';
import { HighlightData } from '../types';
import { generateUpdatePayload } from './cardUtils';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import {
  isElementForOnClickOutside,
  useOnClickOutside
} from './utils/onClickOutside';
import scrollHighlightIntoView from './utils/scrollHighlightIntoView';

export interface EditCardProps {
  isActive: boolean;
  hasUnsavedHighlight: boolean;
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
  onCreate: (isDefaultColor: boolean) => void;
  onBlur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  onRemove: () => void;
  onCancel: () => void;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  data?: HighlightData;
  className: string;
  shouldFocusCard: boolean;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, EditCardProps>((props, ref) => {
  if (!props.isActive) {
    return null;
  }
  return <LoginOrEdit props={props} fref={ref} />;
});

function LoginOrEdit({
  props,
  fref,
}: {
  props: React.PropsWithChildren<EditCardProps>;
  fref: React.ForwardedRef<HTMLElement>;
}) {
  const authenticated = !!useSelector(selectAuth.user);
  const element = React.useRef<HTMLElement>(null);
  const {formatMessage} = useIntl();

  return (
    <div
      className={props.className}
      role='dialog'
      aria-label={formatMessage({id: 'i18n:highlighter:edit-note:label'})}
    >
      <form
        ref={mergeRefs(fref, element)}
        data-analytics-region='edit-note'
        data-highlight-card
      >
        {authenticated ? (
          <ActiveEditCard props={props} element={element}
          />
        ) : (
          <LoginConfirmation onBlur={props.onBlur} />
        )}
      </form>
    </div>
  );
}

function LoginConfirmation({
  onBlur,
}: Pick<EditCardProps, 'data' | 'onBlur'>) {
  const loginLink = useSelector(selectAuth.loginLink);
  const trackShowLogin = useAnalyticsEvent('showLogin');

  React.useEffect(() => {
    trackShowLogin();
  }, [trackShowLogin]);

  return (
    <Confirmation
      data-analytics-label='login'
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={onBlur}
      drawFocus={false}
    />
  );
}

// tslint:disable-next-line:variable-name
const HiddenOnMobile = styled.div`
  ${theme.breakpoints.touchDeviceQuery(css`
    display: none;
  `)}
`;

function ActiveEditCard({
  props,
  element,
}: {
  props: React.PropsWithChildren<EditCardProps>;
  element: React.RefObject<HTMLElement>;
}) {
  const defaultAnnotation = React.useMemo(() => props.data?.annotation ?? '', [
    props.data,
  ]);
  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(
    defaultAnnotation
  );
  const resetAnnotation = React.useCallback(() => {
    setPendingAnnotation(defaultAnnotation);
  }, [defaultAnnotation]);
  const [editingAnnotation, setEditing] = React.useState<boolean>(
    !!props.data && !!props.data.annotation
  );
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(
    false
  );

  const onBlur = props.onBlur;
  const blurIfNotEditing = React.useCallback(() => {
    if (!props.hasUnsavedHighlight && !editingAnnotation) {
      onBlur();
    }
  }, [props.hasUnsavedHighlight, editingAnnotation, onBlur]);

  const elements = [element, ...props.highlight.elements].filter(
    isElementForOnClickOutside
  );

  useOnClickOutside(elements, props.isActive, blurIfNotEditing, {
    capture: true,
  });

  const onHeightChange = props.onHeightChange;
  React.useEffect(() => {
    if (element.current) {
      onHeightChange(element);
    }
  }, [element, onHeightChange]);

  const trackShowCreate = useAnalyticsEvent('showCreate');

  React.useEffect(() => {
    if (!props.data) {
      trackShowCreate();
    }
  }, [props.data, trackShowCreate]);

  const onColorChange = useOnColorChange(props);
  const saveAnnotation = useSaveAnnotation(props, element, pendingAnnotation);

  return (
    <HiddenOnMobile>
      <ColorPicker
        color={props.data?.color}
        onChange={onColorChange}
        onRemove={useOnRemove(props, pendingAnnotation)}
      />
      <AnnotationEditor
        props={props}
        pendingAnnotation={pendingAnnotation}
        onColorChange={onColorChange}
        setEditing={setEditing}
        setPendingAnnotation={setPendingAnnotation}
      />
      {editingAnnotation && props.data && (
        <ButtonGroup>
          <SaveButton
            data={props.data}
            setEditing={setEditing}
            pendingAnnotation={pendingAnnotation}
            setConfirmingDelete={setConfirmingDelete}
            saveAnnotation={saveAnnotation}
          />
          <CancelButton
            props={props}
            setEditing={setEditing}
            resetAnnotation={resetAnnotation}
          />
        </ButtonGroup>
      )}
      {confirmingDelete && props.data && (
        <Confirmation
          data-testid='confirm-delete'
          data-analytics-region='highlighting-delete-note'
          message='i18n:highlighting:confirmation:delete-note'
          confirmMessage='i18n:highlighting:button:delete'
          onConfirm={() => saveAnnotation(props.data as HighlightData)}
          onCancel={() => {
            setEditing(true);
            resetAnnotation();
          }}
          always={() => setConfirmingDelete(false)}
        />
      )}
    </HiddenOnMobile>
  );
}

function useOnRemove(props: EditCardProps, pendingAnnotation: string) {
  const onRemove = props.onRemove;
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  return React.useCallback(() => {
    if (props.data && !props.data.annotation && !pendingAnnotation) {
      onRemove();
      trackDeleteHighlight(props.data.color);
    }
  }, [onRemove, pendingAnnotation, props.data, trackDeleteHighlight]);
}

function AnnotationEditor({
  props,
  pendingAnnotation,
  onColorChange,
  setEditing,
  setPendingAnnotation,
}: {
  props: EditCardProps;
  pendingAnnotation: string;
  onColorChange: ReturnType<typeof useOnColorChange>;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingAnnotation: (value: React.SetStateAction<string>) => void;
}) {
  const textarea = React.useRef<HTMLTextAreaElement>(null);
  const setAnnotationChangesPending = props.setAnnotationChangesPending;
  const updateUnsavedHighlightStatus = React.useCallback(
    (newValue: string) => {
      const currentValue = props.data?.annotation ?? '';

      setPendingAnnotation(newValue);
      if (currentValue !== newValue && !props.hasUnsavedHighlight) {
        setAnnotationChangesPending(true);
      }

      if (currentValue === newValue && props.hasUnsavedHighlight) {
        setAnnotationChangesPending(false);
      }
      setEditing(true);
    },
    [
      props.data?.annotation,
      props.hasUnsavedHighlight,
      setAnnotationChangesPending,
      setEditing,
      setPendingAnnotation,
    ]
  );
  const initializeColor = React.useCallback(() => {
    if (!props.highlight.getStyle()) {
      onColorChange(highlightStyles[0].label, true);
      textarea.current?.blur();
      textarea.current?.focus();
    }
  }, [onColorChange, props.highlight]);

  useFocusElement(textarea, props.shouldFocusCard);

  return (
    <Note
      textareaRef={textarea}
      note={pendingAnnotation}
      onFocus={initializeColor}
      onChange={updateUnsavedHighlightStatus}
    />
  );
}

function SaveButton({
  data,
  setEditing,
  pendingAnnotation,
  setConfirmingDelete,
  saveAnnotation,
}: {
  data: HighlightData;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  pendingAnnotation: string;
  setConfirmingDelete: React.Dispatch<React.SetStateAction<boolean>>;
  saveAnnotation: ReturnType<typeof useSaveAnnotation>;
}) {
  const doSave = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setEditing(false);
      if (pendingAnnotation === '' && data.annotation) {
        setConfirmingDelete(true);
      } else {
        saveAnnotation(data);
      }
    },
    [data, pendingAnnotation, saveAnnotation, setConfirmingDelete, setEditing]
  );

  return (
    <FormattedMessage id='i18n:highlighting:button:save'>
      {msg => (
        <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={doSave}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>
  );
}

function CancelButton({
  props,
  setEditing,
  resetAnnotation,
}: {
  props: EditCardProps;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  resetAnnotation: () => void;
}) {
  const setAnnotationChangesPending = props.setAnnotationChangesPending;
  const onCancel = props.onCancel;
  const cancelEditing = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      resetAnnotation();
      setAnnotationChangesPending(false);
      setEditing(false);
      onCancel();
    },
    [resetAnnotation, setAnnotationChangesPending, setEditing, onCancel]
  );

  useOnEsc(props.isActive, cancelEditing);

  return (
    <FormattedMessage id='i18n:highlighting:button:cancel'>
      {msg => (
        <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={cancelEditing}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>
  );
}

function useOnColorChange(props: EditCardProps) {
  const { highlight, data, locationFilterId, pageId } = props;
  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const onCreate = props.onCreate;
  const dispatch = useDispatch();

  return React.useCallback(
    (color: HighlightColorEnum, isDefault?: boolean) => {
      highlight.setStyle(color);
      if (data) {
        const { updatePayload, preUpdateData } = generateUpdatePayload(data, {
          color,
          id: data.id,
        });

        dispatch(
          updateHighlight(updatePayload, {
            locationFilterId,
            pageId,
            preUpdateData,
          })
        );
        trackEditNoteColor(color);
      } else {
        assertWindow()
          .getSelection()
          ?.removeAllRanges();
        onCreate(isDefault === true);
      }
    },
    [
      highlight,
      data,
      dispatch,
      locationFilterId,
      pageId,
      trackEditNoteColor,
      onCreate,
    ]
  );
}

function useSaveAnnotation(
  props: EditCardProps,
  element: React.RefObject<HTMLElement>,
  pendingAnnotation: string
) {
  const dispatch = useDispatch();
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const { pageId, locationFilterId, highlight } = props;
  const onCancel = props.onCancel;

  return React.useCallback(
    (toSave: HighlightData) => {
      const data = assertDefined(
        props.data,
        'Can\'t update highlight that doesn\'t exist'
      );

      const addedNote = data.annotation === undefined;
      const { updatePayload, preUpdateData } = generateUpdatePayload(data, {
        id: toSave.id,
        annotation: pendingAnnotation,
      });

      dispatch(
        updateHighlight(updatePayload, {
          locationFilterId,
          pageId,
          preUpdateData,
        })
      );
      trackEditAnnotation(addedNote, toSave.color);
      onCancel();
      scrollHighlightIntoView(highlight, element);
    },
    [
      dispatch,
      element,
      highlight,
      locationFilterId,
      onCancel,
      pageId,
      pendingAnnotation,
      props.data,
      trackEditAnnotation,
    ]
  );
}

export default styled(EditCard)`
  background: ${theme.color.neutral.formBackground};
  user-select: none;
  overflow: visible;

  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }

  ${theme.breakpoints.touchDeviceQuery(css`
    visibility: hidden;
  `)}
`;
