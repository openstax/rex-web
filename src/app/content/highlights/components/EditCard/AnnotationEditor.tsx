/**
 * AnnotationEditor Component
 *
 * Handles the textarea for editing highlight annotations.
 * Extracted to separate file to:
 * - Isolate annotation editing concern
 * - Make component reusable
 * - Simplify testing
 * - Reduce complexity of main EditCard component
 */

import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import defer from 'lodash/fp/defer';
import { useFocusElement } from '../../../../reactUtils';
import { highlightStyles } from '../../../constants';
import { setAnnotationChangesPending as setAnnotationChangesPendingAction } from '../../actions';
import { HighlightData } from '../../types';
import Note from '../Note';

/**
 * Props for AnnotationEditor component
 */
export interface AnnotationEditorProps {
  /** Current highlight being edited */
  highlight: Highlight;
  /** Saved highlight data (undefined for new highlights) */
  data?: HighlightData;
  /** Current pending annotation text */
  pendingAnnotation: string;
  /** Whether there are unsaved changes */
  hasUnsavedHighlight: boolean;
  /** Whether the card should be focused */
  shouldFocusCard: boolean;
  /** Function to set editing state */
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  /** Function to update pending annotation */
  setPendingAnnotation: (value: React.SetStateAction<string>) => void;
  /** Function to set annotation changes pending flag */
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  /** Callback to handle color changes */
  onColorChange: (color: HighlightColorEnum, isDefault?: boolean) => void;
}

/**
 * AnnotationEditor - Textarea wrapper for editing highlight notes
 *
 * Responsibilities:
 * - Manages textarea ref and focus behavior
 * - Tracks changes to annotation text
 * - Updates "unsaved changes" state
 * - Initializes highlight color on first focus (for new highlights)
 * - Switches to editing mode when user types
 *
 * Color Initialization Flow:
 * When a user creates a new highlight and focuses the textarea,
 * the component automatically assigns the default color (first in palette).
 * This provides immediate visual feedback and creates the highlight object.
 *
 * Change Tracking:
 * Compares current text with saved text to determine if changes are pending.
 * This enables the "unsaved changes" indicator and warning prompts.
 *
 * @param props - Component props including highlight data and callbacks
 */
export function AnnotationEditor({
  highlight,
  data,
  pendingAnnotation,
  hasUnsavedHighlight,
  shouldFocusCard,
  setEditing,
  setPendingAnnotation,
  setAnnotationChangesPending,
  onColorChange,
}: AnnotationEditorProps) {
  const textarea = React.useRef<HTMLTextAreaElement>(null);

  /**
   * Handles annotation text changes
   *
   * Updates pending annotation state and tracks whether changes
   * differ from the saved value to set the "changes pending" flag.
   * Always enters editing mode when user types.
   */
  const updateUnsavedHighlightStatus = React.useCallback(
    (newValue: string) => {
      const currentValue = data?.annotation ?? '';

      setPendingAnnotation(newValue);

      if (currentValue !== newValue && !hasUnsavedHighlight) {
        setAnnotationChangesPending(true);
      }

      if (currentValue === newValue && hasUnsavedHighlight) {
        setAnnotationChangesPending(false);
      }

      setEditing(true);
    },
    [
      data?.annotation,
      hasUnsavedHighlight,
      setAnnotationChangesPending,
      setEditing,
      setPendingAnnotation,
    ]
  );

  /**
   * Initializes highlight color on first focus
   *
   * For new highlights (no color assigned yet), automatically
   * assigns the first color in the palette when the user focuses
   * the textarea. This creates the highlight and provides visual feedback.
   *
   * The blur/focus dance ensures the color picker interaction
   * doesn't interfere with the textarea focus state.
   */
  const initializeColor = React.useCallback(() => {
    if (!highlight.getStyle()) {
      textarea.current?.blur();

      onColorChange(highlightStyles[0].label, true);

      const setFocus = () => {
        textarea.current?.focus();
      };

      setFocus();
      defer(setFocus);
    }
  }, [onColorChange, highlight]);

  useFocusElement(textarea, shouldFocusCard);

  return (
    <Note
      textareaRef={textarea}
      note={pendingAnnotation}
      onFocus={initializeColor}
      onChange={updateUnsavedHighlightStatus}
      edit={Boolean(data?.annotation)}
    />
  );
}
