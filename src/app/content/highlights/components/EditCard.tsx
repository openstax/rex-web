/**
 * EditCard Component
 *
 * Provides an editable interface for highlight annotations in REX.
 *
 * ## Responsibilities
 *
 * - **Authentication**: Prompts login for unauthenticated users
 * - **Highlight Creation**: Creates new highlights from text selections
 * - **Highlight Editing**: Allows color changes and annotation updates
 * - **Highlight Deletion**: Removes highlights with confirmation
 *
 * ## Component Architecture
 *
 * The EditCard has been refactored to follow SOLID principles by extracting
 * components and hooks into separate modules:
 *
 * - `EditCard/AuthenticationGate.tsx` - Authentication logic
 * - `EditCard/hooks.ts` - Business logic (remove, color change, save)
 * - `EditCard/ActionButtons.tsx` - Save and Cancel buttons
 * - `EditCard/AnnotationEditor.tsx` - Annotation textarea
 *
 * ## State Management Strategy
 *
 * **Local State** (this component):
 * - `pendingAnnotation` - Current text in textarea (may differ from saved)
 * - `editingAnnotation` - Whether annotation textarea is in edit mode
 * - `confirmingDelete` - Whether delete confirmation dialog is showing
 *
 * **Redux State** (via actions/selectors):
 * - Saved highlight data (color, annotation, position)
 * - User authentication status
 * - Annotation changes pending flag
 *
 * ## Event Flow
 *
 * 1. User selects text → Highlight created → EditCard shown
 * 2. User chooses color → useOnColorChange hook → Redux update
 * 3. User types note → AnnotationEditor → Local state update
 * 4. User clicks Save → SaveButton → useSaveAnnotation → Redux update
 * 5. User clicks outside → Focus lost → Card hidden
 *
 * @example
 * <EditCard
 *   isActive={true}
 *   highlight={highlight}
 *   pageId="page-123"
 *   locationFilterId="chapter-5"
 *   onCreate={handleCreate}
 *   onBlur={handleBlur}
 *   // ... other props
 * />
 */

import { Highlight } from '@openstax/highlighter';
import { FocusEvent, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { ButtonGroup } from '../../../components/Button';
import { useTrapTabNavigation } from '../../../reactUtils';
import theme from '../../../theme';
import { MAIN_CONTENT_ID } from '../../../context/constants';
import {
  clearFocusedHighlight,
  setAnnotationChangesPending as setAnnotationChangesPendingAction,
} from '../actions';
import { cardPadding } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import { LoginOrEdit } from './EditCard/AuthenticationGate';
import { SaveButton, CancelButton } from './EditCard/ActionButtons';
import { AnnotationEditor } from './EditCard/AnnotationEditor';
import { useOnRemove, useOnColorChange, useSaveAnnotation } from './EditCard/hooks';

/**
 * Props for EditCard component
 */
export interface EditCardProps {
  /** Whether the card is currently active/visible */
  isActive: boolean;
  /** Whether there are unsaved annotation changes */
  hasUnsavedHighlight: boolean;
  /** The highlight object being edited */
  highlight: Highlight;
  /** Filter ID for the current location (e.g., chapter) */
  locationFilterId: string;
  /** ID of the current page */
  pageId: string;
  /** Callback when highlight is created */
  onCreate: (isDefaultColor: boolean) => void;
  /** Callback when focus leaves the card */
  onBlur: typeof clearFocusedHighlight;
  /** Callback to set annotation changes pending flag */
  setAnnotationChangesPending: typeof setAnnotationChangesPendingAction;
  /** Callback to remove the highlight */
  onRemove: () => void;
  /** Callback when editing is canceled */
  onCancel: () => void;
  /** Callback when card height changes */
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  /** Saved highlight data (undefined for new highlights) */
  data?: HighlightData;
  /** CSS className for styled component */
  className: string;
  /** Whether the card should auto-focus */
  shouldFocusCard: boolean;
  /** Whether to show minimized version (not implemented) */
  minimize?: boolean;
}

/**
 * EditCard - Root component for highlight editing interface
 *
 * This is a simple wrapper that:
 * 1. Returns null when not active (card is hidden)
 * 2. Forwards ref to inner components
 * 3. Delegates to LoginOrEdit for authentication check
 *
 * The forwarded ref allows parent components to measure and position
 * the card relative to the highlight.
 */
// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, EditCardProps>((props, ref) => {
  const element = React.useRef<HTMLElement>(null);

  if (!props.isActive) {
    return null;
  }

  const isNewSelection = props.highlight.elements.length === 0;

  return (
    <LoginOrEdit
      className={props.className}
      isNewSelection={isNewSelection}
      shouldFocusCard={props.shouldFocusCard}
      hasAnnotation={Boolean(props.data?.annotation)}
      onBlur={props.onBlur}
      fref={ref}
      elementRef={element}
    >
      <ActiveEditCard props={props} element={element} />
    </LoginOrEdit>
  );
});

/**
 * ActiveEditCard - Main editing interface component
 *
 * This component coordinates the editing interface, managing:
 * - Annotation text state (pending vs saved)
 * - Editing mode state
 * - Delete confirmation state
 * - Focus and blur behavior
 * - Analytics tracking
 *
 * ## State Management
 *
 * The component maintains three pieces of local state:
 *
 * 1. **pendingAnnotation**: Current text in textarea, may differ from saved value
 * 2. **editingAnnotation**: Whether textarea is in edit mode (shows Save/Cancel)
 * 3. **confirmingDelete**: Whether delete confirmation dialog is showing
 *
 * ## Focus Management
 *
 * The card needs careful focus management to work correctly:
 *
 * - When clicking outside the card → Blur card (unless editing)
 * - When clicking in main content → Remove text selection
 * - When pressing Escape → Cancel editing (handled by CancelButton)
 * - When pressing Tab → Trap focus within card (accessibility)
 *
 * ## Height Change Notifications
 *
 * The card notifies its parent when its height changes (e.g., when
 * showing/hiding buttons) so the parent can reposition it correctly.
 */
function ActiveEditCard({
  props,
  element,
}: {
  props: React.PropsWithChildren<EditCardProps>;
  element: React.RefObject<HTMLElement>;
}) {
  const defaultAnnotation = React.useMemo(() => props.data?.annotation ?? '', [props.data]);

  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(defaultAnnotation);

  const resetAnnotation = React.useCallback(() => {
    setPendingAnnotation(defaultAnnotation);
  }, [defaultAnnotation]);

  const [editingAnnotation, setEditing] = React.useState(Boolean(props?.data?.annotation));

  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);

  const { onBlur, hasUnsavedHighlight } = props;

  /**
   * Blur handler that only triggers when not editing
   *
   * We don't want to blur the card if the user is actively editing
   * or if there are unsaved changes, as that would lose their work.
   */
  const blurIfNotEditing = React.useCallback(() => {
    if (!hasUnsavedHighlight && !editingAnnotation) {
      onBlur();
    }
  }, [onBlur, hasUnsavedHighlight, editingAnnotation]);

  /**
   * Handles focus moving to main content area
   *
   * When focus moves from the card to the main content, we need to:
   * 1. Blur the card (if not editing)
   * 2. Remove the text selection (if highlight not yet created)
   *
   * This prevents the selection from persisting after the user
   * clicks away without creating a highlight.
   */
  const deselectRange = React.useCallback(
    ({ target }: FocusEvent) => {
      const targetAsNode = target as HTMLElement;
      const mainEl = document?.getElementById(MAIN_CONTENT_ID);

      // Only deselect if:
      // - Highlight hasn't been created yet (!props.data?.color)
      // - Focus moved to main content area
      if (!props.data?.color && targetAsNode !== mainEl && mainEl?.contains(targetAsNode)) {
        blurIfNotEditing();
        document?.getSelection()?.removeAllRanges();
      }
    },
    [blurIfNotEditing, props.data?.color]
  );

  React.useEffect(() => {
    document?.addEventListener('focusin', deselectRange);
    return () => document?.removeEventListener('focusin', deselectRange);
  }, [deselectRange]);

  /**
   * Notify parent when card element is available
   *
   * The parent needs the element ref to calculate positioning
   * and respond to height changes.
   */
  const onHeightChange = props.onHeightChange;
  React.useEffect(() => {
    if (element.current) {
      onHeightChange(element);
    }
  }, [element, onHeightChange]);

  const trackShowCreate = useAnalyticsEvent('showCreate');

  /**
   * Track analytics when showing create card
   *
   * We only track this event for new highlights (props.data is undefined).
   * This helps us measure how many highlight creation flows are started.
   */
  React.useEffect(() => {
    if (!props.data) {
      trackShowCreate();
    }
  }, [props.data, trackShowCreate]);

  const onColorChange = useOnColorChange({
    highlight: props.highlight,
    data: props.data,
    locationFilterId: props.locationFilterId,
    pageId: props.pageId,
    onCreate: props.onCreate,
  });

  const saveAnnotation = useSaveAnnotation(
    {
      data: props.data,
      pageId: props.pageId,
      locationFilterId: props.locationFilterId,
      highlight: props.highlight,
      onCancel: props.onCancel,
    },
    element,
    pendingAnnotation
  );

  const removeHighlight = useOnRemove(
    {
      data: props.data,
      onRemove: props.onRemove,
    },
    pendingAnnotation
  );

  const ref = React.useRef<HTMLElement>(null);

  /**
   * Trap tab navigation when editing
   *
   * When the annotation textarea is in edit mode, trap focus within
   * the card so keyboard users can't accidentally tab out and lose focus.
   * This is important for accessibility.
   */
  useTrapTabNavigation(ref, editingAnnotation);

  return (
    <div ref={ref}>
      <ColorPicker
        color={props.data?.color}
        onChange={onColorChange}
        onRemove={removeHighlight}
      />

      <AnnotationEditor
        highlight={props.highlight}
        data={props.data}
        pendingAnnotation={pendingAnnotation}
        hasUnsavedHighlight={props.hasUnsavedHighlight}
        shouldFocusCard={props.shouldFocusCard}
        setEditing={setEditing}
        setPendingAnnotation={setPendingAnnotation}
        setAnnotationChangesPending={props.setAnnotationChangesPending}
        onColorChange={onColorChange}
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
            isActive={props.isActive}
            setEditing={setEditing}
            resetAnnotation={resetAnnotation}
            setAnnotationChangesPending={props.setAnnotationChangesPending}
            onCancel={props.onCancel}
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
    </div>
  );
}

/**
 * Styled EditCard component
 *
 * Applies visual styling to the card:
 * - Background color from theme
 * - Prevents text selection on card controls
 * - Spacing for button group
 * - Hides card on touch devices (mobile)
 */
// tslint:disable-next-line
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
