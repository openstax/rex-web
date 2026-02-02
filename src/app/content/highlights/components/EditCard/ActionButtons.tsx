import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';
import { useOnEsc } from '../../../../reactUtils';
import { HighlightData } from '../../types';
import { setAnnotationChangesPending as setAnnotationChangesPendingAction } from '../../actions';

export interface SaveButtonProps {
  data: HighlightData;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  pendingAnnotation: string;
  setConfirmingDelete: React.Dispatch<React.SetStateAction<boolean>>;
  saveAnnotation: (data: HighlightData) => void;
}

/**
 * SaveButton - Saves annotation changes or shows delete confirmation
 * if annotation was cleared.
 */
export function SaveButton({
  data,
  setEditing,
  pendingAnnotation,
  setConfirmingDelete,
  saveAnnotation,
}: SaveButtonProps) {
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

export interface CancelButtonProps {
  isActive: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  resetAnnotation: () => void;
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  onCancel: () => void;
}

/**
 * CancelButton - Cancels annotation editing and resets to original value.
 * Handles Escape key press for keyboard users.
 */
export function CancelButton({
  isActive,
  setEditing,
  resetAnnotation,
  setAnnotationChangesPending,
  onCancel,
}: CancelButtonProps) {
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

  useOnEsc(isActive, cancelEditing);

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
