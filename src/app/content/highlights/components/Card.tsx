import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useServices } from '../../../context/Services';
import { useFocusIn, useMatchMobileMediumQuery } from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
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
  setAnnotationChangesPending
} from '../actions';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import { mainCardStyles } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import scrollHighlightIntoView from './utils/scrollHighlightIntoView';
import showConfirmation from './utils/showConfirmation';

export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isActive: boolean;
  lastActive: number;
  isTocOpen: boolean;
  hasQuery: boolean;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  remove: typeof requestDeleteHighlight;
  blur: typeof clearFocusedHighlight;
  setAnnotationChangesPending: typeof setAnnotationChangesPending;
  data?: HighlightData;
  className: string;
  zIndex: number;
  shouldFocusCard: boolean;
  topOffset?: number;
  highlightOffsets?: { top: number; bottom: number };
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  isHidden: boolean;
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
      (!hasUnsavedHighlight || (await showConfirmation(services)))
    ) {
      focus(id);
    }
  }, [isActive, hasUnsavedHighlight, id, focus, services]);
  const element = React.useRef<HTMLElement>(null);
  const commonProps = React.useMemo(
    () => ({
      className: props.className,
      highlight: props.highlight,
      isActive: props.isActive,
      onBlur: props.blur,
      onHeightChange: props.onHeightChange,
      ref: element,
      shouldFocusCard: props.shouldFocusCard,
    }),
    [props]
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
    if (annotation) {
      highlight.elements.forEach(el =>
        (el as HTMLElement).classList.add('has-note')
      );
    } else {
      highlight.elements.forEach(el =>
        (el as HTMLElement).classList.remove('has-note')
      );
    }
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

function NoteOrCard({
  props,
  setHighlightRemoved,
  locationFilterId,
  computedProps,
}: {
  props: CardPropsWithBookAndPage;
  setHighlightRemoved: React.Dispatch<React.SetStateAction<boolean>>;
  locationFilterId: string;
  computedProps: ReturnType<typeof useComputedProps>;
}) {
  const {
    focusCard,
    editing,
    setEditing,
    annotation,
    hasUnsavedHighlight,
    commonProps,
  } = computedProps;
  const onRemove = React.useCallback(() => {
    if (props.data) {
      setHighlightRemoved(true);
      props.remove(props.data, {
        locationFilterId,
        pageId: props.page.id,
      });
    }
  }, [locationFilterId, props, setHighlightRemoved]);
  const style = highlightStyles.find(
    search => props.data && search.label === props.data.color
  );

  return (
    <div onClick={focusCard} data-testid='card'>
      {!editing && style && annotation ? (
        <DisplayNote
          {...commonProps}
          onRemove={onRemove}
          style={style}
          note={annotation}
          focus={props.focus}
          onEdit={() => setEditing(true)}
        />
      ) : <React.Fragment>{
        commonProps.isActive &&
        <EditCardWithOnCreate
          cardProps={props as CardPropsWithBookAndPage}
          commonProps={{ ...commonProps, onRemove }}
          locationFilterId={locationFilterId}
          hasUnsavedHighlight={hasUnsavedHighlight}
          setEditing={setEditing}
        />
      }</React.Fragment>}
    </div>
  );
}

type ComputedProps = ReturnType<typeof useComputedProps>;
type EditCardProps = {
  commonProps: object;
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

// tslint:disable-next-line: variable-name
const StyledCard = styled(Card)`
  ${mainCardStyles}
`;

// Styling is expensive and most Cards don't need to render
function PreCard(props: CardProps) {
  const isMobile = useMatchMobileMediumQuery();
  const computedProps = useComputedProps(props);

  if (!computedProps.annotation && (!props.isActive || isMobile)) {
    return null;
  }
  return (
    <StyledCard {...props} />
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
