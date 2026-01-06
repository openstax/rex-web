/**
 * Action Buttons for EditCard
 *
 * Save and Cancel buttons used in the highlight editing interface.
 * These buttons are extracted to:
 * - Make them reusable in other contexts
 * - Simplify testing (buttons can be tested independently)
 * - Reduce complexity of the main EditCard component
 * - Follow Single Responsibility Principle
 */

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
 * SaveButton - Button to save annotation changes
 *
 * Handles the save flow:
 * 1. Prevents form submission (e.preventDefault)
 * 2. Exits editing mode
 * 3. If annotation was cleared and previously existed, shows delete confirmation
 * 4. Otherwise, saves the annotation immediately
 *
 * The confirmation step prevents accidental deletion when a user
 * clears the annotation text and clicks save.
 *
 * @param props - Component props including save callback and state setters
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
 * CancelButton - Button to cancel annotation editing
 *
 * Handles the cancel flow:
 * 1. Resets annotation text to original value
 * 2. Clears the "changes pending" flag
 * 3. Exits editing mode
 * 4. Calls onCancel callback to clean up state
 *
 * Also sets up Escape key handler to allow keyboard users
 * to cancel editing by pressing Esc.
 *
 * @param props - Component props including cancel callback and state setters
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
