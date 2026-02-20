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
import { useIntl } from 'react-intl';
import {
  clearFocusedHighlight,
  setAnnotationChangesPending as setAnnotationChangesPendingAction,
} from '../actions';
import { useConfirmationToastContext } from '../../components/ConfirmationToast';
import { cardPadding } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import { LoginOrEdit } from './EditCard/AuthenticationGate';
import { SaveButton, CancelButton } from './EditCard/ActionButtons';
import { AnnotationEditor } from './EditCard/AnnotationEditor';
import { useOnRemove, useOnColorChange, useSaveAnnotation } from './EditCard/hooks';

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
  minimize?: boolean;
}

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
 * Coordinates the editing interface with careful focus management:
 * - When clicking outside → Blur card (unless editing)
 * - When clicking in main content → Remove text selection
 * - When pressing Tab → Trap focus within card (accessibility)
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

  const blurIfNotEditing = React.useCallback(() => {
    if (!hasUnsavedHighlight && !editingAnnotation) {
      onBlur();
    }
  }, [onBlur, hasUnsavedHighlight, editingAnnotation]);

  /**
   * When focus moves to main content, blur and remove selection
   * if highlight hasn't been created yet.
   */
  const deselectRange = React.useCallback(
    ({ target }: FocusEvent) => {
      const targetAsNode = target as HTMLElement;
      const mainEl = document?.getElementById(MAIN_CONTENT_ID);

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

  const onColorChange = useOnColorChange({
    highlight: props.highlight,
    data: props.data,
    locationFilterId: props.locationFilterId,
    pageId: props.pageId,
    onCreate: props.onCreate,
  });

  const showToast = useConfirmationToastContext();
  const intl = useIntl();

  const rawSaveAnnotation = useSaveAnnotation(
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

  const saveAnnotation = React.useCallback(
    (data: HighlightData) => {
      rawSaveAnnotation(data);
      showToast({
        message: intl.formatMessage({ id: 'i18n:highlighting:toast:save-success' }),
      });
    },
    [rawSaveAnnotation, showToast, intl]
  );

  const removeHighlight = useOnRemove(
    {
      data: props.data,
      onRemove: props.onRemove,
    },
    pendingAnnotation
  );

  const ref = React.useRef<HTMLElement>(null);

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
          onConfirm={() => {
            // use raw to avoid announcing "highlight saved" before "highlight deleted"
            rawSaveAnnotation(props.data as HighlightData);
            showToast({
              message: intl.formatMessage({ id: 'i18n:highlighting:toast:delete-success' }),
            });
          }}
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
