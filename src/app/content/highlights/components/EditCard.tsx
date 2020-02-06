import { Highlight } from '@openstax/highlighter';
import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { HighlightColorEnum } from '@openstax/highlighter/highlights-client/dist/models/Highlight';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import Button, { ButtonGroup } from '../../../components/Button';
import theme from '../../../theme';
import { assertWindow, mergeRefs } from '../../../utils';
import { clearFocusedHighlight, editStateChange, updateHighlight } from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import onClickOutside from './utils/onClickOutside';

interface Props {
  authenticated: boolean;
  loginLink: string;
  isFocused: boolean;
  hasUnsavedHighlight: boolean;
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
  onCreate: () => void;
  onBlur: typeof clearFocusedHighlight;
  onEditStateChange: typeof editStateChange;
  onSave: typeof updateHighlight;
  onRemove: () => void;
  onCancel: () => void;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, Props>((
  {
    authenticated,
    className,
    data,
    highlight,
    locationFilterId,
    pageId,
    isFocused,
    hasUnsavedHighlight,
    loginLink,
    onBlur,
    onCancel,
    onCreate,
    onEditStateChange,
    onRemove,
    onSave,
  }: Props,
  ref
) => {
  const defaultAnnotation = () => data && data.annotation ? data.annotation : '';
  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(defaultAnnotation());
  const [editingAnnotation, setEditing] = React.useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  const trackCreateNote = useAnalyticsEvent('createNote');
  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  const blurIfNotEditing = () => {
    if (!editingAnnotation) {
      onBlur();
    }
  };
 
  React.useEffect(() => {
    if (!isFocused && hasUnsavedHighlight) {
        setPendingAnnotation(defaultAnnotation());
        setEditing(false);
    }
  }, [isFocused, hasUnsavedHighlight]);

  React.useEffect(onClickOutside(element, isFocused, blurIfNotEditing), [isFocused, editingAnnotation]);

  const onColorChange = (color: HighlightColorEnum, isDefault?: boolean) => {
    highlight.setStyle(color);
    if (data) {
      onSave({
        highlight: {
          annotation: data.annotation,
          color: color as string as HighlightUpdateColorEnum,
        },
        id: data.id,
      }, {
        locationFilterId,
        pageId,
      });
      trackEditNoteColor(color);
    } else {
      assertWindow().getSelection().removeAllRanges();
      onCreate();
      trackCreateNote(isDefault ? 'default' : color);
    }
  };

  const saveAnnotation = (toSave: HighlightData) => {
    const addedNote = (data && data.annotation === undefined) ? true : false;

    onSave({
      highlight: {
        annotation: pendingAnnotation,
        color: toSave.color as string as HighlightUpdateColorEnum,
      },
      id: toSave.id,
    }, {
      locationFilterId,
      pageId,
    });
    trackEditAnnotation(addedNote, toSave.color);
    onCancel();
  };

  const updateUnsavedHighlightStatus = (newValue: string) => {
    if (!data) {
      return;
    }

    if (data.annotation !== newValue && !hasUnsavedHighlight) {
      onEditStateChange(true);
    }

    if ((data.annotation === newValue || (data.annotation === undefined && newValue === '')) && hasUnsavedHighlight) {
      onEditStateChange(false);
    }
  };

  const cancelEditing = () => {
    setPendingAnnotation(defaultAnnotation());
    setEditing(false);
    onEditStateChange(false);
    onCancel();
  };

  return <form
    className={className}
    ref={mergeRefs(ref, element)}
    data-analytics-region='edit-note'
  >
    <ColorPicker color={data ? data.color : undefined} onChange={onColorChange} onRemove={() => {
      if (data && !data.annotation && !pendingAnnotation) {
        onRemove();
        trackDeleteHighlight(data.color);
      }
    }} />
    <Note
      note={pendingAnnotation}
      onFocus={() => {
        if (!highlight.getStyle()) {
          onColorChange(highlightStyles[0].label, true);
        }
      }}
      onChange={(newValue) => {
        setPendingAnnotation(newValue);
        updateUnsavedHighlightStatus(newValue);
        setEditing(true);
      }}
    />
    {editingAnnotation && data && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);

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
    {confirmingDelete && data && <Confirmation
      data-testid='confirm-delete'
      data-analytics-region='highlighting-delete-note'
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={() => saveAnnotation(data)}
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
      onCancel={onBlur}
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
