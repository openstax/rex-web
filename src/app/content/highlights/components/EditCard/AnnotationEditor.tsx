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

export interface AnnotationEditorProps {
  highlight: Highlight;
  data?: HighlightData;
  pendingAnnotation: string;
  hasUnsavedHighlight: boolean;
  shouldFocusCard: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingAnnotation: (value: React.SetStateAction<string>) => void;
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  onColorChange: (color: HighlightColorEnum, isDefault?: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * AnnotationEditor - Textarea for editing highlight notes.
 * Initializes highlight color on first focus for new highlights.
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
  textareaRef,
}: AnnotationEditorProps) {

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
   * For new highlights, assigns default color when textarea is focused.
   */
  const initializeColor = React.useCallback(() => {
    if (!highlight.getStyle()) {
      textareaRef.current?.blur();

      onColorChange(highlightStyles[0].label, true);

      const setFocus = () => {
        textareaRef.current?.focus();
      };

      setFocus();
      defer(setFocus);
    }
  }, [onColorChange, highlight, textareaRef]);

  useFocusElement(textareaRef, shouldFocusCard);

  return (
    <Note
      textareaRef={textareaRef}
      note={pendingAnnotation}
      onFocus={initializeColor}
      onChange={updateUnsavedHighlightStatus}
      edit={Boolean(data?.annotation)}
    />
  );
}
