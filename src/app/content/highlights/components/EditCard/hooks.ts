/**
 * EditCard Business Logic Hooks
 *
 * This module contains custom hooks that encapsulate the business logic
 * for highlight operations: removing, changing colors, and saving annotations.
 *
 * These hooks are extracted from the main EditCard component to:
 * - Improve testability (hooks can be tested independently)
 * - Enhance reusability (hooks can be used in other components)
 * - Follow Single Responsibility Principle (each hook has one clear purpose)
 * - Reduce complexity of the main component
 */

import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { assertDefined, assertWindow } from '../../../../utils';
import { updateHighlight } from '../../actions';
import { HighlightData } from '../../types';
import { generateUpdatePayload } from '../cardUtils';
import scrollHighlightIntoView from '../utils/scrollHighlightIntoView';

/**
 * Props required for useOnRemove hook
 */
export interface UseOnRemoveProps {
  data?: HighlightData;
  onRemove: () => void;
}

/**
 * Hook that handles highlight removal logic
 *
 * Returns a callback to remove a highlight, or null if removal is not allowed.
 * Removal is only allowed when:
 * - Highlight data exists (highlight has been saved)
 * - No annotation exists on the highlight
 * - No pending annotation text
 * - Highlight has a color (has been created)
 *
 * When called, the hook:
 * 1. Calls the onRemove callback to remove the highlight
 * 2. Tracks analytics event with the highlight color
 *
 * @param props - Object containing highlight data and onRemove callback
 * @param pendingAnnotation - Current text in the annotation editor
 * @returns Remove callback function, or null if removal not allowed
 *
 * @example
 * const removeHighlight = useOnRemove({ data, onRemove }, pendingText);
 * // Pass to ColorPicker: <ColorPicker onRemove={removeHighlight} />
 */
export function useOnRemove(
  props: UseOnRemoveProps,
  pendingAnnotation: string
): (() => void) | null {
  const { onRemove, data } = props;
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  const removeAndTrack = React.useCallback(() => {
    const definedData = assertDefined(data, 'data must be defined');
    onRemove();
    trackDeleteHighlight(definedData.color);
  }, [onRemove, data, trackDeleteHighlight]);

  return data && !data.annotation && !pendingAnnotation && data.color
    ? removeAndTrack
    : null;
}

/**
 * Props required for useOnColorChange hook
 */
export interface UseOnColorChangeProps {
  highlight: Highlight;
  data?: HighlightData;
  locationFilterId: string;
  pageId: string;
  onCreate: (isDefaultColor: boolean) => void;
}

/**
 * Hook that handles highlight color changes
 *
 * Returns a callback to change the highlight color. The behavior differs
 * based on whether the highlight has been saved yet:
 *
 * For existing highlights (data exists):
 * 1. Updates the highlight visual style
 * 2. Dispatches Redux action to save color change
 * 3. Tracks analytics event
 *
 * For new selections (data doesn't exist):
 * 1. Updates the highlight visual style
 * 2. Clears the text selection
 * 3. Calls onCreate to create the highlight
 *
 * @param props - Object containing highlight data and callbacks
 * @returns Color change callback function
 *
 * @example
 * const handleColorChange = useOnColorChange({ highlight, data, ... });
 * // Pass to ColorPicker: <ColorPicker onChange={handleColorChange} />
 */
export function useOnColorChange(props: UseOnColorChangeProps) {
  const { highlight, data, locationFilterId, pageId, onCreate } = props;
  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
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
    [highlight, data, dispatch, locationFilterId, pageId, trackEditNoteColor, onCreate]
  );
}

/**
 * Props required for useSaveAnnotation hook
 */
export interface UseSaveAnnotationProps {
  data?: HighlightData;
  pageId: string;
  locationFilterId: string;
  highlight: Highlight;
  onCancel: () => void;
}

/**
 * Hook that handles annotation saving logic
 *
 * Returns a callback to save the current annotation text to a highlight.
 * When called, the hook:
 * 1. Validates that highlight data exists
 * 2. Generates update payload with new annotation text
 * 3. Dispatches Redux action to save to database
 * 4. Tracks analytics event (distinguishes adding new note vs editing)
 * 5. Calls onCancel to clean up editing state
 * 6. Scrolls highlight into view if needed
 * 7. Focuses the highlight for keyboard navigation
 *
 * @param props - Object containing highlight data and callbacks
 * @param element - Ref to card element for scroll calculations
 * @param pendingAnnotation - Current text to save
 * @returns Save callback function
 *
 * @example
 * const saveAnnotation = useSaveAnnotation(props, cardRef, annotationText);
 * // Call on save: <Button onClick={() => saveAnnotation(data)} />
 */
export function useSaveAnnotation(
  props: UseSaveAnnotationProps,
  element: React.RefObject<HTMLElement>,
  pendingAnnotation: string
) {
  const { data, pageId, locationFilterId, highlight, onCancel } = props;
  const dispatch = useDispatch();
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');

  return React.useCallback(
    (toSave: HighlightData) => {
      const definedData = assertDefined(
        data,
        'Can\'t update highlight that doesn\'t exist'
      );

      const addedNote = definedData.annotation === undefined;

      const { updatePayload, preUpdateData } = generateUpdatePayload(definedData, {
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
      highlight.focus();
    },
    [
      data,
      dispatch,
      element,
      highlight,
      locationFilterId,
      onCancel,
      pageId,
      pendingAnnotation,
      trackEditAnnotation,
    ]
  );
}
