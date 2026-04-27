import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { useServices } from '../../../context/Services';
import { useFocusIn } from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import { highlightStyles } from '../../constants';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as contentSelect from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import {
  clearFocusedHighlight,
  createHighlight,
  focusHighlight,
  requestDeleteHighlight,
  setAnnotationChangesPending,
} from '../actions';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import { getHighlightBottomOffset, getHighlightTopOffset, getPreferEnd } from './cardUtils';
import { OVERLAP_CARD_TOP_OFFSET } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import scrollHighlightIntoView from './utils/scrollHighlightIntoView';
import showConfirmation from './utils/showConfirmation';
import { useConfirmationToastContext } from '../../components/ConfirmationToast';
import { useIntl } from 'react-intl';


export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isActive: boolean;
  lastActive: number;
  isTocOpen: boolean | null;
  hasQuery: boolean;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  remove: typeof requestDeleteHighlight;
  blur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPending;
  data?: HighlightData;
  zIndex: number;
  shouldFocusCard: boolean;
  topOffset?: number;
  highlightOffsets?: { top: number; bottom: number };
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  isHidden: boolean;
  preferEnd: boolean;
}

type CardPropsWithBookAndPage = Omit<CardProps, 'book' | 'page'> & {
  book: Exclude<CardProps['book'], undefined>;
  page: Exclude<CardProps['page'], undefined>;
};

function useComputedProps(props: CardProps) {
  const annotation = props.data && props.data.annotation;
  const services = useServices();
  const { isActive, highlight, focus, onHeightChange, lastActive } = props;
  const { id } = highlight;
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const hasUnsavedHighlight = useSelector(selectHighlights.hasUnsavedHighlight);
  const focusCard = React.useCallback(async() => {
    if (
      !isActive &&
      !assertDocument().activeElement?.closest?.('[data-no-card-activate]') &&
      (!hasUnsavedHighlight || (await showConfirmation(services)))
    ) {
      focus(id);
    }
  }, [isActive, hasUnsavedHighlight, id, focus, services]);
  const element = React.useRef<HTMLElement | null>(null);

  const commonProps = React.useMemo(
    () => ({
      highlight: props.highlight,
      isActive: props.isActive,
      onBlur: props.blur,
      onHeightChange,
      ref: element,
      shouldFocusCard: props.shouldFocusCard,
    }),
    [props, onHeightChange]
  );

  useFocusIn(element, true, focusCard);

  React.useEffect(() => {
    if (!lastActive) {
      setEditing(false);
    } else {
      scrollHighlightIntoView(highlight, element);
    }
  }, [element, lastActive, highlight]);

  React.useEffect(() => {
    const action = annotation ? 'add' : 'remove';

    highlight.elements.forEach(el =>
      (el as unknown as HTMLElement).classList[action]('has-note')
    );
  }, [highlight.elements, annotation]);

  React.useEffect(() => {
    if (!annotation && !isActive) {
      onHeightChange({ current: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation, isActive]); // onHeightChange

  return React.useMemo(
    () => ({
      focusCard,
      editing,
      setEditing,
      annotation,
      hasUnsavedHighlight,
      commonProps,
    }),
    [annotation, editing, focusCard, hasUnsavedHighlight, commonProps]
  );
}

function useLocationFilterId(page: CardProps['page']): string | undefined {
  const locationFilters = useSelector(
    selectHighlights.highlightLocationFilters
  );
  const location = React.useMemo(() => {
    return page && getHighlightLocationFilterForPage(locationFilters, page);
  }, [locationFilters, page]);
  const locationFilterId = location && stripIdVersion(location.id);

  return locationFilterId;
}

function Card(props: CardProps) {
  const locationFilterId = useLocationFilterId(props.page);
  const [highlightRemoved, setHighlightRemoved] = React.useState<boolean>(
    false
  );
  const computedProps = useComputedProps(props);

  if (
    !props.highlight.range ||
    !props.page ||
    !props.book ||
    !locationFilterId ||
    highlightRemoved
  ) {
    return null;
  }

  return (
    <NoteOrCard
      props={props as CardPropsWithBookAndPage}
      setHighlightRemoved={setHighlightRemoved}
      locationFilterId={locationFilterId}
      computedProps={computedProps}
    />
  );
}

type ComputedProps = ReturnType<typeof useComputedProps>;
type CommonProps = ComputedProps['commonProps'];

function NoteOrCard({
  props,
  setHighlightRemoved,
  locationFilterId,
  computedProps,
}: {
  props: CardPropsWithBookAndPage;
  setHighlightRemoved: React.Dispatch<React.SetStateAction<boolean>>;
  locationFilterId: string;
  computedProps: ComputedProps;
}) {
  const {
    focusCard,
    editing,
    setEditing,
    annotation,
    hasUnsavedHighlight,
    commonProps,
  } = computedProps;
  const showToast = useConfirmationToastContext();
  const intl = useIntl();
  const onRemove = React.useCallback(() => {
    if (props.data) {
      setHighlightRemoved(true);
      props.remove(props.data, {
        locationFilterId,
        pageId: props.page.id,
      });
      showToast({
        message: intl.formatMessage({ id: 'i18n:highlighting:toast:highlight-delete' }),
      });
    }
  }, [locationFilterId, props, showToast, intl, setHighlightRemoved]);
  const style = highlightStyles.find(
    search => props.data && search.label === props.data.color
  );

  // Calculate dynamic CSS custom properties for positioning
  const topOffset = props.topOffset !== undefined
    ? props.topOffset
    : getHighlightBottomOffset(props.container, props.highlight);

  // For overlap mode positioning: only compute highlight offset for active cards.
  // When highlightOffsets is provided, use it; otherwise compute from highlight position.
  const highlightOffset = props.isActive
    ? (props.highlightOffsets
        ? (props.preferEnd
            ? props.highlightOffsets.bottom
            : props.highlightOffsets.top - OVERLAP_CARD_TOP_OFFSET)
        : (props.preferEnd
            ? getHighlightBottomOffset(props.container, props.highlight)
            : (() => {
                const computedTopOffset = getHighlightTopOffset(props.container, props.highlight);
                return computedTopOffset !== undefined
                  ? computedTopOffset - OVERLAP_CARD_TOP_OFFSET
                  : undefined;
              })()))
    : undefined;

  const cardStyle: React.CSSProperties = {
    ...(topOffset !== undefined && { '--card-top-offset': `${topOffset}px` }),
    '--card-z-index': props.zIndex,
    '--highlight-color': style?.focused,
    ...(highlightOffset !== undefined && { '--card-highlight-offset': `${highlightOffset}px` }),
  } as React.CSSProperties;

  const wrapperElement = React.useRef<HTMLElement | null>(null);

  // Update the main element ref to point to the wrapper for focus/scroll
  React.useEffect(() => {
    commonProps.ref.current = wrapperElement.current;
  }, [commonProps.ref, wrapperElement]);

  // Intercept onHeightChange calls from inner components and pass the wrapper ref instead.
  // This ensures height measurements include the wrapper's padding and box-shadow.
  const onHeightChangeWrapper = React.useCallback((_ref: React.RefObject<HTMLElement>) => {
    // Pass the wrapper element ref, not the inner component's ref
    commonProps.onHeightChange(wrapperElement as React.RefObject<HTMLElement>);
  }, [commonProps, wrapperElement]);

  return (
    <div
      ref={wrapperElement}
      className="highlight-card"
      onClick={focusCard}
      data-testid='card'
      data-active={props.isActive}
      data-hidden={props.isHidden}
      data-toc-open={props.isTocOpen === null || props.isTocOpen}
      data-has-query={props.hasQuery}
      style={cardStyle}
    >
      {!editing && style && annotation ? (
        <DisplayNote
          {...{ ...commonProps, onHeightChange: onHeightChangeWrapper }}
          onRemove={onRemove}
          style={style}
          note={annotation}
          focus={props.focus}
          onEdit={() => setEditing(true)}
        />
      ) : (
        <EditCardWithOnCreate
          cardProps={props}
          commonProps={{ ...commonProps, onRemove, onHeightChange: onHeightChangeWrapper }}
          locationFilterId={locationFilterId}
          hasUnsavedHighlight={hasUnsavedHighlight}
          setEditing={setEditing}
        />
      )}
    </div>
  );
}

type EditCardProps = {
  commonProps: CommonProps & {onRemove: () => void};
  cardProps: CardPropsWithBookAndPage;
  locationFilterId: string;
} & Pick<ComputedProps, 'hasUnsavedHighlight' | 'setEditing'>;

function EditCardWithOnCreate({
  commonProps,
  cardProps,
  locationFilterId,
  hasUnsavedHighlight,
  setEditing,
}: EditCardProps) {
  const { create, highlight, highlighter, book, page } = cardProps;
  const onCreate = React.useCallback(
    (isDefaultColor: boolean) => {
      create(
        {
          ...highlight.serialize().getApiPayload(highlighter, highlight),
          scopeId: book.id,
          sourceId: page.id,
          sourceMetadata: {
            bookVersion: book.contentVersion,
            pipelineVersion: book.archiveVersion,
          },
          sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
        },
        {
          isDefaultColor,
          locationFilterId,
          pageId: page.id,
        }
      );
    },
    [book, create, highlight, highlighter, locationFilterId, page.id]
  );
  const stopEditing = React.useCallback(() => setEditing(false), [setEditing]);

  return (
    <EditCard
      {...commonProps}
      locationFilterId={locationFilterId}
      hasUnsavedHighlight={hasUnsavedHighlight}
      pageId={cardProps.page.id}
      onCreate={onCreate}
      setAnnotationChangesPending={cardProps.setAnnotationChangesPending}
      onCancel={stopEditing}
      data={cardProps.data}
    />
  );
}

// Styling is expensive and most Cards don't need to render
function PreCard(props: CardProps) {
  const computedProps = useComputedProps(props);
  const preferEnd = getPreferEnd();

  if (!computedProps.annotation && (!props.isActive)) {
    return null;
  }
  return (
    <Card {...props} preferEnd={preferEnd} />
  );
}

export default connect(
  (state: AppState, ownProps: { highlight: Highlight }) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights
      .highlights(state)
      .find(search => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isActive: selectHighlights.focused(state) === ownProps.highlight.id,
    isTocOpen: contentSelect.tocOpen(state),
    lastActive:
      selectHighlights.focused(state) === ownProps.highlight.id &&
      selectHighlights.lastFocused(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    focus: flow(focusHighlight, dispatch),
    remove: flow(requestDeleteHighlight, dispatch),
    setAnnotationChangesPending: flow(setAnnotationChangesPending, dispatch),
  })
)(PreCard);
