import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement, KeyboardEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import ResizeObserver from 'resize-observer-polyfill';
import styled from 'styled-components';
import { isHtmlElement } from '../../../guards';
import { useFocusLost, useKeyCombination, useFocusHighlight } from '../../../reactUtils';
import { AppState } from '../../../types';
import { assertDefined } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { highlightKeyCombination } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { editCardVisibilityHandler, getHighlightOffset, noopKeyCombinationHandler, updateCardsPositions } from './cardUtils';

export interface WrapperProps {
  hasQuery: boolean;
  isTocOpen: boolean;
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

function checkIfHiddenByCollapsedAncestor(highlight: Highlight) {
  const highlightElement = highlight.elements[0] as HTMLElement;
  const collapsedAncestor = highlightElement
    ? highlightElement.closest('details[data-type="solution"]:not([open])')
    : null;
  return Boolean(collapsedAncestor);
}

function useCardPositionObserver(
  container: HTMLElement,
  focusedHighlight: Highlight | undefined,
  highlights: Highlight[],
  cardsHeights: Map<string, number>
) {
  const [offsets, setOffsets] = React.useState<Map<string, { top: number, bottom: number }>>(new Map());
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const getOffsetsForHighlight = React.useCallback((highlight: Highlight) => {
    const newOffsets = assertDefined(
      getHighlightOffset(container, highlight),
      `Couldn't get offsets for highlight with an id: ${highlight.id}`
    );

    setOffsets((state) => new Map(state).set(highlight.id, newOffsets));
    return newOffsets;
  }, [container]);
  const updatePositions = React.useCallback(() => updateCardsPositions(
      focusedHighlight,
      highlights,
      cardsHeights,
      getOffsetsForHighlight,
      checkIfHiddenByCollapsedAncestor
    ), [cardsHeights, focusedHighlight, getOffsetsForHighlight, highlights]);
  // This creates a function that doesn't require dependency updates, for use by
  // the resizeObserver effect. A little nicer than using a ref.
  const [, dispatchPositions] = React.useReducer(
    () => setCardsPositions(updatePositions()),
    undefined
  );

  React.useEffect(() => dispatchPositions(), [updatePositions]);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(dispatchPositions);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [container]);

  return [cardsPositions, offsets];
}

function useCardsHeights() {
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());
  const onHeightChange = React.useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current ? ref.current.offsetHeight : 0;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height));
    }
  }, [cardsHeights]);

  return [cardsHeights, onHeightChange] as const;
}

function CardsForHighlights({highlights, container, focusedHighlight, shouldFocusCard, highlighter}: {
  highlights: Highlight[];
  container: HTMLElement;
  focusedHighlight: Highlight | undefined;
  shouldFocusCard: boolean;
  highlighter: Highlighter;
}) {
  const [cardsHeights, onHeightChange] = useCardsHeights();
  const [cardsPositions, offsets] = useCardPositionObserver(
    container,
    focusedHighlight,
    highlights,
    cardsHeights
  );
  const [isHiddenByEscape, dispatch] = React.useReducer(
    editCardVisibilityHandler,
    new Map(highlights.map((highlight) => [highlight.id, false]))
  );
  const hideCard = () => {
    focusedHighlight?.focus();
    dispatch({ type: 'HIDE', id: focusedHighlight?.id });
  };
  const showCard = (cardId: string | undefined) => {
    dispatch({ type: 'SHOW', id: cardId });
  };
  /*
  * Allow to show EditCard using Enter key
  * It is important to preserve the default behavior of Enter key
  */
  useKeyCombination({key: 'Enter'}, () => showCard(focusedHighlight?.id), undefined, false);

  // Allow to hide EditCard using Escape key
  useKeyCombination({key: 'Escape'}, hideCard, undefined, false);
  useFocusHighlight(showCard, highlights);

  return <>
    {highlights.map((highlight, index) => {
      const focusThisCard = shouldFocusCard && focusedHighlight === highlight;
      return <Card
        highlighter={highlighter}
        highlight={highlight}
        key={highlight.id}
        container={container}
        topOffset={cardsPositions.get(highlight.id)}
        highlightOffsets={offsets.get(highlight.id)}
        onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
        zIndex={highlights.length - index}
        shouldFocusCard={focusThisCard}
        isHidden={checkIfHiddenByCollapsedAncestor(highlight) || isHiddenByEscape.get(highlight.id)}
      />;
    })}
  </>;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const [shouldFocusCard, setShouldFocusCard] = React.useState(false);
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);

  // This function is triggered by keyboard shortcut defined in useKeyCombination(...)
  // It moves focus between Card component and highlight in the content.
  const moveFocus = React.useCallback(({target}: KeyboardEvent) => {
    const activeElement = isHtmlElement(target) ? target : null;

    if (!focusedHighlight || !activeElement || !element.current) {
      return;
    }

    if (element.current.contains(activeElement)) {
      focusedHighlight.focus();
    } else {
      setShouldFocusCard(focusedHighlight !== undefined);
    }
  }, [focusedHighlight]);

  useKeyCombination(highlightKeyCombination, moveFocus, noopKeyCombinationHandler([container, element]));
  // Clear shouldFocusCard when focus is lost from the CardWrapper.
  // If we don't do this then card related for the focused highlight will be focused automatically.
  useFocusLost(element, shouldFocusCard, React.useCallback(() => setShouldFocusCard(false), []));

  return <div className={className} ref={element}>
    <CardsForHighlights
      highlights={highlights}
      container={container}
      focusedHighlight={focusedHighlight}
      shouldFocusCard={shouldFocusCard}
      highlighter={highlighter}
    />
  </div>;
};

function MaybeWrapper(props: WrapperProps) {
  if (!props.highlights.length) {
    return null;
  }
  return <Wrapper {...props} />;
}

export default connect(
  (state: AppState) => ({
    // These are used in the cardStyles.ts
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(styled(MaybeWrapper)`
  ${mainWrapperStyles}
`);
