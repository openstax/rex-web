import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement, KeyboardEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import ResizeObserver from 'resize-observer-polyfill';
import styled from 'styled-components';
import { isHtmlElement } from '../../../guards';
import { useFocusLost, useKeyCombination, useFocusHighlight } from '../../../reactUtils';
import { AppState } from '../../../types';
import { assertDefined, assertDocument } from '../../../utils';
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

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());
  const [offsets, setOffsets] = React.useState<Map<string, { top: number, bottom: number }>>(new Map());
  const [shouldFocusCard, setShouldFocusCard] = React.useState(false);
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);

  // Walk backwards through DOM to find the closest previous focusable element
  const findPreviousFocusableElement = React.useCallback((startElement: HTMLElement): HTMLElement | null => {
    let current: HTMLElement | null = startElement.previousElementSibling as HTMLElement;

    // Check previous siblings first
    while (current) {
      if (current.tabIndex >=0  && current.offsetWidth > 0 && current.offsetHeight > 0) {
        return current;
      }
      current = current.previousElementSibling as HTMLElement;
    }

    // If no focusable siblings, move up to parent and check its previous siblings
    if (startElement.parentElement && startElement.parentElement !== container) {
      return findPreviousFocusableElement(startElement.parentElement);
    }

    return null;
  }, [container]);

  const setNewCardsPositionsRef = React.useRef<() => void>();
  const [isHiddenByEscape, dispatch] = React.useReducer(
    editCardVisibilityHandler,
    new Map(highlights.map((highlight) => [highlight.id, false]))
  );

  // This function is triggered by keyboard shortcut defined in useKeyCombination(...)
  // It moves focus between Card component and highlight in the content.
  const moveFocus = React.useCallback((event: KeyboardEvent) => {
    const activeElement = isHtmlElement(event.target) ? event.target : null;

    if (!focusedHighlight || !activeElement || !element.current) {
      return;
    }

    if (element.current.contains(activeElement)) {
      focusedHighlight.focus();
    } else {
      setShouldFocusCard(focusedId !== undefined);
    }
  }, [focusedHighlight, focusedId]);

  const restorePreviousFocus = React.useCallback((targetHighlightId?: string) => {
    if (targetHighlightId) {
      // When deleting, focus the specified highlight (previous one in tab order)
      const targetHighlight = highlights.find(h => h.id === targetHighlightId);
      if (targetHighlight) {
        setTimeout(() => {
          targetHighlight.focus();
        }, 0);
        return;
      }
    }

    // When closing with Escape, focus should go back to the current highlight
    // so that the next Tab continues the natural tab flow
    if (focusedHighlight && focusedHighlight.elements[0]) {
      setTimeout(() => {
        focusedHighlight.focus();
      }, 0);
      return;
    }

    // Fallback: focus the container or document body
    setTimeout(() => {
      container.focus();
    }, 0);
  }, [focusedHighlight, highlights, container]);

  const hideCard = () => {
    dispatch({ type: 'HIDE', id: focusedId });
    setShouldFocusCard(false); // Reset focus card state when closing
    restorePreviousFocus();
  };

  const showCard = (cardId: string | undefined) => {
    dispatch({ type: 'SHOW', id: cardId });
  };

  useKeyCombination(highlightKeyCombination, moveFocus, noopKeyCombinationHandler([container, element]));

  /*
  * Allow to show EditCard using Enter key
  * It is important to preserve the default behavior of Enter key
  */
  useKeyCombination({key: 'Enter'}, () => showCard(focusedId), undefined, false);

  // Allow to hide EditCard using Escape key
  useKeyCombination({key: 'Escape'}, hideCard, undefined, false);

  // Allow Tab key to focus inside the card when a highlight card is shown
  const focusInsideCard = React.useCallback((event?: KeyboardEvent) => {
    // Only focus inside the card if there's a focused highlight AND its card is already visible
    // Check if we're not already inside a card element
    const activeElement = assertDocument().activeElement as HTMLElement;
    const isInsideCard = element.current?.contains(activeElement);

    if (focusedHighlight && element.current && !isInsideCard) {
      // Only focus inside if the card is already active/visible (not just appearing)
      const cardIsAlreadyVisible = focusedId && !isHiddenByEscape.get(focusedId);
      if (cardIsAlreadyVisible) {
        setShouldFocusCard(true);
      }
    }
  }, [focusedHighlight, focusedId, isHiddenByEscape]);

  // useKeyCombination({key: 'Tab'}, focusInsideCard, noopKeyCombinationHandler([container, element]), false);
  useKeyCombination({key: 'Tab'}, moveFocus, noopKeyCombinationHandler([container, element]), false);

  // Clear shouldFocusCard when focus is lost from the CardWrapper.
  // If we don't do this then card related for the focused highlight will be focused automatically.
  useFocusLost(element, shouldFocusCard, React.useCallback(() => setShouldFocusCard(false), [setShouldFocusCard]));
  useFocusHighlight(showCard, highlights);

  const onHeightChange = React.useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  }, [cardsHeights]);

  const getOffsetsForHighlight = React.useCallback((highlight: Highlight) => {
    const newOffsets = assertDefined(
      getHighlightOffset(container, highlight),
      `Couldn't get offsets for highlight with an id: ${highlight.id}`
    );
    setOffsets((state) => new Map(state).set(highlight.id, newOffsets));
    return newOffsets;
  }, [container]);

  const checkIfHiddenByCollapsedAncestor = (highlight: Highlight) => {
    const highlightElement = highlight.elements[0] as HTMLElement;
    const collapsedAncestor = highlightElement
      ? highlightElement.closest('details[data-type="solution"]:not([open])')
      : null;
    return Boolean(collapsedAncestor);
  };

  React.useEffect(() => {
    setNewCardsPositionsRef.current = () => {
      const positions = updateCardsPositions(
        focusedHighlight,
        highlights,
        cardsHeights,
        getOffsetsForHighlight,
        checkIfHiddenByCollapsedAncestor
      );
      setCardsPositions(positions);
    };
    setNewCardsPositionsRef.current();
  }, [cardsHeights, focusedHighlight, getOffsetsForHighlight, highlights]);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      assertDefined(
        setNewCardsPositionsRef.current,
        'setNewCardsPositionsRef should be already defined by useEffect'
      )();
    });
    resizeObserver.observe(container);
    return () => {
        resizeObserver.disconnect();
    };
  }, [container]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight, index) => {
        const focusThisCard = shouldFocusCard && focusedId === highlight.id;
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
          restorePreviousFocus={restorePreviousFocus}
        />;
      })}
    </div>
    : null;
};

export default connect(
  (state: AppState) => ({
    // These are used in the cardStyles.ts
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(styled(Wrapper)`
  ${mainWrapperStyles}
`);
