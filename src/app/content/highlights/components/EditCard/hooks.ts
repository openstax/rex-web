/**
 * Business logic hooks for highlight operations: removing, changing colors,
 * and saving annotations.
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

export interface UseOnRemoveProps {
  data?: HighlightData;
  onRemove: () => void;
}

/**
 * Returns callback to remove highlight, or null if removal not allowed.
 * Removal only allowed for highlights without annotations.
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

export interface UseOnColorChangeProps {
  highlight: Highlight;
  data?: HighlightData;
  locationFilterId: string;
  pageId: string;
  onCreate: (isDefaultColor: boolean) => void;
}

/**
 * Returns callback to change highlight color. For new highlights, creates
 * the highlight. For existing highlights, updates color and saves.
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

export interface UseSaveAnnotationProps {
  data?: HighlightData;
  pageId: string;
  locationFilterId: string;
  highlight: Highlight;
  onCancel: () => void;
}

/**
 * Returns callback to save annotation text. Tracks analytics,
 * scrolls highlight into view, and focuses it after save.
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
