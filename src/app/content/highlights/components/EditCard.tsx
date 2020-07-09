import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import * as selectAuth from '../../../auth/selectors';
import Button, { ButtonGroup } from '../../../components/Button';
import { isHtmlElement } from '../../../guards';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertDefined, assertWindow, mergeRefs } from '../../../utils';
import { highlightStyles } from '../../constants';
import {
  clearFocusedHighlight,
  setAnnotationChangesPending as setAnnotationChangesPendingAction,
  updateHighlight,
} from '../actions';
import { cardPadding } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import onClickOutside from './utils/onClickOutside';

export interface EditCardProps {
  isFocused: boolean;
  hasUnsavedHighlight: boolean;
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
  onCreate: () => void;
  onBlur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  onRemove: () => void;
  onCancel: () => void;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, EditCardProps>((props, ref) => {
  const authenticated = !!useSelector(selectAuth.user);
  const loginLink = useSelector(selectAuth.loginLink);
  const dispatch = useDispatch();
  const defaultAnnotation = () => props.data && props.data.annotation ? props.data.annotation : '';
  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(defaultAnnotation());
  const [editingAnnotation, setEditing] = React.useState<boolean>(!!props.data && !!props.data.annotation);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  const trackCreateNote = useAnalyticsEvent('createNote');
  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const trackShowCreate = useAnalyticsEvent('showCreate');
  const trackShowLogin = useAnalyticsEvent('showLogin');
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  const blurIfNotEditing = React.useCallback(() => {
    if (!props.hasUnsavedHighlight && !editingAnnotation) {
      props.onBlur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.hasUnsavedHighlight, editingAnnotation]);

  const cancelEditing = () => {
    setPendingAnnotation(defaultAnnotation());
    props.setAnnotationChangesPending(false);
    setEditing(false);
    props.onCancel();
  };

  useOnEsc(element, props.isFocused, cancelEditing);

  React.useEffect(() => {
    if (props.data) { return; }
    if (authenticated) {
      trackShowCreate();
    } else {
      trackShowLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(
    onClickOutside(
      [element.current, ...props.highlight.elements].filter(isHtmlElement),
      props.isFocused,
      blurIfNotEditing,
      { capture: true }
    ),
    [props.isFocused, blurIfNotEditing]
  );

  React.useEffect(() => {
    if (element.current) {
      props.onHeightChange(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, editingAnnotation, props.isFocused]);

  const onColorChange = (color: HighlightColorEnum, isDefault?: boolean) => {
    props.highlight.setStyle(color);
    if (props.data) {
      dispatch(updateHighlight({
        highlight: {
          annotation: props.data.annotation,
          color: color as string as HighlightUpdateColorEnum,
        },
        id: props.data.id,
      }, {
        locationFilterId: props.locationFilterId,
        pageId: props.pageId,
      }));
      trackEditNoteColor(color);
    } else {
      assertWindow().getSelection().removeAllRanges();
      props.onCreate();
      trackCreateNote(isDefault ? 'default' : color);
    }
  };

  const saveAnnotation = (toSave: HighlightData) => {
    const addedNote = (props.data && props.data.annotation === undefined) ? true : false;

    dispatch(updateHighlight({
      highlight: {
        annotation: pendingAnnotation,
        color: toSave.color as string as HighlightUpdateColorEnum,
      },
      id: toSave.id,
    }, {
      locationFilterId: props.locationFilterId,
      pageId: props.pageId,
    }));
    trackEditAnnotation(addedNote, toSave.color);
    props.onCancel();
  };

  const updateUnsavedHighlightStatus = (newValue: string) => {
    const currentValue = props.data && props.data.annotation ? props.data.annotation : '';
    if (currentValue !== newValue && !props.hasUnsavedHighlight) {
      props.setAnnotationChangesPending(true);
    }

    if (currentValue === newValue && props.hasUnsavedHighlight) {
      props.setAnnotationChangesPending(false);
    }
  };

  return <form
    className={props.className}
    ref={mergeRefs(ref, element)}
    data-analytics-region='edit-note'
  >
    <ColorPicker color={props.data ? props.data.color : undefined} onChange={onColorChange} onRemove={() => {
      if (props.data && !props.data.annotation && !pendingAnnotation) {
        props.onRemove();
        trackDeleteHighlight(props.data.color);
      }
    }} />
    <Note
      note={pendingAnnotation}
      onFocus={() => {
        if (!props.highlight.getStyle()) {
          onColorChange(highlightStyles[0].label, true);
        }
      }}
      onChange={(newValue) => {
        setPendingAnnotation(newValue);
        updateUnsavedHighlightStatus(newValue);
        setEditing(true);
      }}
    />
    {editingAnnotation && props.data && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);
            const data = assertDefined(props.data, 'props.data should be defined');
            if (pendingAnnotation === '' && data.annotation) {
              setConfirmingDelete(true);
            } else {
              saveAnnotation(data);
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            cancelEditing();
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>}
    {confirmingDelete && props.data && <Confirmation
      data-testid='confirm-delete'
      data-analytics-region='highlighting-delete-note'
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={() => saveAnnotation(assertDefined(props.data, 'props.data should be defined'))}
      onCancel={() => {
        setEditing(true);
        setPendingAnnotation(defaultAnnotation());
      }}
      always={() => setConfirmingDelete(false)}
    />}
    {!authenticated && <Confirmation
      data-analytics-label='login'
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={props.onBlur}
    />}
  </form>;
});

export default styled(EditCard)`
  background: ${theme.color.neutral.formBackground};
  user-select: none;
  overflow: visible;

  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }

  ${theme.breakpoints.mobile(css`
    visibility: hidden;
  `)}
`;
