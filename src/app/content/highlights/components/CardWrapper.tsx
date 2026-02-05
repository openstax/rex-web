import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement, KeyboardEvent, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import flow from 'lodash/fp/flow';
import { clearFocusedHighlight } from '../actions';
import ResizeObserver from 'resize-observer-polyfill';
import styled from 'styled-components';
import { isHtmlElement } from '../../../guards';
import { useFocusLost, useKeyCombination, useFocusHighlight, useOnEsc } from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
import { assertDefined, assertDocument, stripHtml } from '../../../utils';
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
  dispatch: Dispatch;
}

function checkIfHiddenByCollapsedAncestor(highlight: Highlight) {
  const highlightElement = highlight.elements[0] as HTMLElement;
  const collapsedAncestor = highlightElement
    ? highlightElement.closest('details[data-type="solution"]:not([open])')
    : null;
  return Boolean(collapsedAncestor);
}

/**
 * Hook to apply viewport stickiness for the active card
 * Keeps the card in view as long as its highlight is partially visible
 */
function useViewportStickiness(
  focusedHighlight: Highlight | undefined,
  cardElement: HTMLElement | null,
  cardHeight: number
) {
  const [stickyOffset, setStickyOffset] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!focusedHighlight || !cardElement) {
      setStickyOffset(null);
      return;
    }

    const handleScroll = () => {
      const highlight = focusedHighlight;
      if (!highlight.range) {
        setStickyOffset(null);
        return;
      }

      const highlightRect = highlight.range.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const cardRect = cardElement.getBoundingClientRect();

      // Check if highlight is in viewport (at least partially)
      const highlightTopInView = highlightRect.top < viewportHeight;
      const highlightBottomInView = highlightRect.bottom > 0;
      const highlightInViewport = highlightTopInView && highlightBottomInView;

      if (!highlightInViewport) {
        // Highlight is completely out of view, don't stick
        setStickyOffset(null);
        return;
      }

      // Calculate sticky positions
      const cardTop = cardRect.top;
      const cardBottom = cardRect.bottom;

      // If card is scrolling out of the top of viewport, stick it to the top
      if (cardTop < 0 && highlightRect.bottom > cardHeight) {
        // Keep card at top of viewport
        const offset = -cardTop;
        setStickyOffset(offset);
        return;
      }

      // If card is scrolling out of the bottom of viewport, stick it to the bottom
      if (cardBottom > viewportHeight && highlightRect.top < viewportHeight - cardHeight) {
        // Keep card at bottom of viewport
        const offset = viewportHeight - cardBottom;
        setStickyOffset(offset);
        return;
      }

      // Card is in normal range, no stickiness needed
      setStickyOffset(null);
    };

    // Run on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [focusedHighlight, cardElement, cardHeight]);

  return stickyOffset;
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

  const updatePositions = React.useCallback(() => {
    return updateCardsPositions(
      focusedHighlight,
      highlights,
      cardsHeights,
      getOffsetsForHighlight,
      checkIfHiddenByCollapsedAncestor
    );
  }, [cardsHeights, focusedHighlight, getOffsetsForHighlight, highlights]);

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

function useFocusedHighlight(
  highlights: Highlight[],
  element: React.RefObject<HTMLElement>,
  container: HTMLElement,
  unfocus: () => void
) {
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);
  const [shouldFocusCard, setShouldFocusCard] = React.useState(false);
  const document = assertDocument();
  const isExistingHighlight = focusedHighlight && focusedHighlight.elements.length > 0;

  // catches the "click here" event sent by the EditCard
  React.useEffect(() => {
    const handler = () => setShouldFocusCard(true);

    document.addEventListener('showCardEvent', handler);
    return () => document.removeEventListener('showCardEvent', handler);
  }, [document]);

  // Catches escape in Textarea to hide card
  React.useEffect(() => {
    const handler = () => {
      setShouldFocusCard(false);
    };

    document.addEventListener('hideCardEvent', handler);
    return () => document.removeEventListener('hideCardEvent', handler);
  }, [document]);

  // Ensure focusedHighlight is actually focused
  React.useEffect(() => {
    if (isExistingHighlight) {
      focusedHighlight?.focus();
    }
  }, [focusedHighlight, isExistingHighlight]);

  // Pressing Enter moves the users from a highlight to the editor
  const editOnEnter = React.useCallback(() => {
    if (focusedHighlight) {
      setShouldFocusCard(true);
    }
  }, [focusedHighlight]);

  // Watch for selection change when the highlight is just a selection
  // if selection becomes empty, clear the focusedHighlight
  React.useEffect(() => {
    const handler = () => {
      if (!isExistingHighlight && document.getSelection()?.isCollapsed) {
        unfocus();
        setShouldFocusCard(false);
      }
    };

    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [document, isExistingHighlight, unfocus]);

  // This function is triggered by keyboard shortcut defined in useKeyCombination(...)
  // It moves focus between Card component and highlight in the content.
  const moveFocus = React.useCallback(({target}: KeyboardEvent) => {
    const activeElement = isHtmlElement(target) ? target : null;
    const cardIsFocused = focusedHighlight && element.current?.contains(activeElement);

    if (cardIsFocused) {
      focusedHighlight.focus();
    }
    setShouldFocusCard(!cardIsFocused);
  }, [element, focusedHighlight]);

  const keyContainer = focusedHighlight?.elements?.[0] ?? container;
  // @ts-expect-error contains is not on HTMLElement
  const notFiredFromHighlight = (el: Element) => !(focusedHighlight && keyContainer.contains(el));

  useKeyCombination({key: 'Enter'}, editOnEnter, notFiredFromHighlight);
  useKeyCombination(highlightKeyCombination, moveFocus, noopKeyCombinationHandler([container, element]));
  // Clear shouldFocusCard when focus is lost from the CardWrapper.
  // If we don't do this then card related for the focused highlight will be focused automatically.
  useFocusLost(element, shouldFocusCard && Boolean(isExistingHighlight), React.useCallback(() => {
    setShouldFocusCard(false);
  }, []));

  return [focusedHighlight, shouldFocusCard, setShouldFocusCard] as const;
}

function CardsForHighlights({
  highlights, container, focusedHighlight, shouldFocusCard, setShouldFocusCard, highlighter,
}: {
  highlights: Highlight[];
  container: HTMLElement;
  focusedHighlight: Highlight | undefined;
  shouldFocusCard: boolean;
  setShouldFocusCard: (v: boolean) => void;
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

  // Track the focused card element for viewport stickiness
  const [focusedCardElement, setFocusedCardElement] = React.useState<HTMLElement | null>(null);
  const focusedCardHeight = focusedHighlight ? cardsHeights.get(focusedHighlight.id) || 0 : 0;
  const viewportStickyOffset = useViewportStickiness(focusedHighlight, focusedCardElement, focusedCardHeight);

  // First time, Esc closes it to the instructions; second Esc disappears it
  const hideCard = () => {
    if (!focusedHighlight) {
      return;
    }
    if (focusedHighlight.elements.length) {
      focusedHighlight.focus();
    } else {
      window?.getSelection()?.removeAllRanges();
    }
    if (shouldFocusCard) {
      setShouldFocusCard(false);
    } else {
      dispatch({ type: 'HIDE', id: focusedHighlight?.id });
    }
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
  useOnEsc(true, hideCard);
  useFocusHighlight(showCard, highlights);
  return <>
    {highlights.map((highlight, index) => {
      const focusThisCard = shouldFocusCard && focusedHighlight === highlight;
      const isFocusedCard = focusedHighlight === highlight;
      return <Card
        highlighter={highlighter}
        highlight={highlight}
        key={highlight.id}
        container={container}
        topOffset={cardsPositions.get(highlight.id)}
        highlightOffsets={offsets.get(highlight.id)}
        onHeightChange={(ref: React.RefObject<HTMLElement>) => {
          onHeightChange(highlight.id, ref);
          // Track the focused card element for viewport stickiness
          if (isFocusedCard && ref.current !== focusedCardElement) {
            setFocusedCardElement(ref.current);
          }
        }}
        zIndex={highlights.length - index}
        shouldFocusCard={focusThisCard}
        isHidden={checkIfHiddenByCollapsedAncestor(highlight) || isHiddenByEscape.get(highlight.id)}
        viewportStickyOffset={isFocusedCard ? viewportStickyOffset : null}
      />;
    })}
  </>;
}

const Wrapper = ({highlights, className, container, highlighter, dispatch}: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const unfocus = flow(clearFocusedHighlight, dispatch);
  const [focusedHighlight, shouldFocusCard, setShouldFocusCard] = useFocusedHighlight(
    highlights, element, container, unfocus);

  React.useEffect(() => {
    const processedEvents = new WeakSet<MouseEvent | CustomEvent>();
    function handleGlobalMouseUp(event: MouseEvent) {
      // Avoid infinite loop calling over and over the event
      if (processedEvents.has(event)) return;
      const selection = window?.getSelection();
      if (!selection || selection.isCollapsed) return;

      // Re-dispatch the mouseup inside the highlighter container
      const simulated = new CustomEvent('mouseup', {
        bubbles: true,
        cancelable: true,
      });
      processedEvents.add(simulated);
      container.dispatchEvent(simulated);
    }
    document?.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document?.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [container]);

  return <div className={className} ref={element}>
    <CardsForHighlights
      highlights={highlights}
      container={container}
      focusedHighlight={focusedHighlight}
      shouldFocusCard={shouldFocusCard}
      setShouldFocusCard={setShouldFocusCard}
      highlighter={highlighter}
    />
  </div>;
};

function MaybeWrapper(props: WrapperProps) {
  const hasValidHighlight = props.highlights.some(h => {
    if (typeof h.content !== 'string') return false;
    const plainText = stripHtml(h.content, true);

    const containsImage = /<img[\s\S]*?>/i.test(h.content);
    const containsMath = /class=["']?MathJax["']?/i.test(h.content);

    return (
      plainText.length > 0 || containsImage || containsMath
    );
  });

  if (!hasValidHighlight) {
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
