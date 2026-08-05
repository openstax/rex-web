import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement, KeyboardEvent, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import flow from 'lodash/fp/flow';
import { clearFocusedHighlight } from '../actions';
import ResizeObserver from 'resize-observer-polyfill';
import { isHtmlElement, isElement } from '../../../guards';
import {
  tabbableElementsSelector,
  useFocusHighlight,
  useFocusLost,
  useKeyCombination,
  useOnEsc,
  withSelectionPreserved,
} from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
import { assertDefined, assertDocument, assertWindow, stripHtml } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { highlightKeyCombination } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { editCardVisibilityHandler, getHighlightOffset, noopKeyCombinationHandler, updateCardsPositions } from './cardUtils';

export interface WrapperProps {
  hasQuery: boolean;
  isTocOpen: boolean | null;
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

// Finds the first content control that Tab would reach after the whole highlight,
// skipping the highlight's own injected screen-reader spans.
function findNextContentTabbable(container: HTMLElement, highlight: Highlight): HTMLElement | null {
  const elements = highlight.elements as HTMLElement[];
  const lastEl = elements[elements.length - 1];
  if (!lastEl) {
    return null;
  }
  const following = assertDocument().getRootNode().DOCUMENT_POSITION_FOLLOWING;
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(tabbableElementsSelector));
  return candidates.find((el) =>
    // eslint-disable-next-line no-bitwise
    Boolean(lastEl.compareDocumentPosition(el) & following)
    && !elements.some((mark) => mark === el || mark.contains(el))
  ) ?? null;
}

// The card holding the edit/create control lives in a separate DOM layer, so it isn't
// reachable by Tab in document order from its highlight. useTabRouting bridges that gap
// using standard Tab/Shift+Tab: it moves focus from the focused highlight (its injected
// [data-for-screenreaders] span) into the visible card, back to the highlight, and out to
// the next content control - satisfying keyboard operability (WCAG 2.1.1) without moving
// the card in the DOM or relying on non-standard keys (Enter/Alt+H) to place focus.
function useTabRouting(
  focusedHighlight: Highlight | undefined,
  element: React.RefObject<HTMLElement>,
  container: HTMLElement,
  unfocus: () => void
) {
  const document = assertDocument();

  React.useEffect(() => {
    if (!focusedHighlight) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      // The card node for the focused highlight (EditCard dialog wrapper or DisplayNote root).
      const cardNode = element.current?.querySelector<HTMLElement>('[data-active="true"]') ?? null;
      const inCard = Boolean(cardNode?.contains(active));
      // While a note is actively being edited, the EditCard tab trap owns Tab within the
      // card; leave the card boundaries to it.
      const isEditing = Boolean(cardNode?.querySelector('[data-editing="true"]'));
      // tabbableElementsSelector (not focusableItemQuery) so tabindex="-1" controls -
      // e.g. the color-picker radios, which are reached via their radiogroup, not Tab -
      // are excluded and the card's real first/last tab stops are used.
      const focusables = cardNode
        ? Array.from(cardNode.querySelectorAll<HTMLElement>(tabbableElementsSelector))
        : [];
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      const elements = focusedHighlight.elements as HTMLElement[];
      const startEl = elements[0];
      const isNewSelection = elements.length === 0;

      // Tab from the highlight's screen-reader span moves focus into the card.
      const onHighlightSpan = Boolean(
        startEl && startEl.contains(active) && active.hasAttribute('data-for-screenreaders')
      );
      if (onHighlightSpan && !event.shiftKey && firstFocusable) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }

      if (inCard && !isEditing && !isNewSelection) {
        // Shift+Tab off the card's first control returns to the highlight.
        if (event.shiftKey && active === firstFocusable) {
          event.preventDefault();
          focusedHighlight.focus();
          return;
        }
        // Tab off the card's last control continues to the next content control,
        // clearing the highlight focus as native Tab-past would have.
        if (!event.shiftKey && active === lastFocusable) {
          const next = findNextContentTabbable(container, focusedHighlight);
          if (next) {
            event.preventDefault();
            unfocus();
            next.focus();
          }
          return;
        }
      }

      // New selection: there is no highlight span yet. Route Tab forward from the content
      // into the pending "create" card, preserving the live selection. Shift+Tab back has
      // no stable anchor to return to, so it is left to default behavior (best effort).
      if (isNewSelection && !inCard && !event.shiftKey && firstFocusable) {
        const selection = assertWindow().getSelection();
        const anchorInContainer = Boolean(
          selection?.anchorNode && container.contains(selection.anchorNode)
        );
        if (selection && !selection.isCollapsed && anchorInContainer) {
          event.preventDefault();
          withSelectionPreserved(() => firstFocusable.focus());
        }
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [document, focusedHighlight, element, container, unfocus]);
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
  const moveFocus = React.useCallback(({ target }: KeyboardEvent) => {
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

  useKeyCombination({ key: 'Enter' }, editOnEnter, notFiredFromHighlight);
  useKeyCombination(highlightKeyCombination, moveFocus, noopKeyCombinationHandler([container, element]));
  // Standard-keyboard path: Tab/Shift+Tab move focus between the highlight and its card.
  useTabRouting(focusedHighlight, element, container, unfocus);
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
  useKeyCombination({ key: 'Enter' }, () => showCard(focusedHighlight?.id), undefined, false);

  // Allow to hide EditCard using Escape key
  useOnEsc(true, hideCard);
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

const Wrapper = ({ highlights, hasQuery, isTocOpen, container, highlighter, dispatch }: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const unfocus = flow(clearFocusedHighlight, dispatch);
  const [focusedHighlight, shouldFocusCard, setShouldFocusCard] = useFocusedHighlight(
    highlights, element, container, unfocus);

  React.useEffect(() => {
    const processedEvents = new WeakSet<MouseEvent | CustomEvent>();
    function handleGlobalMouseUp(event: MouseEvent) {
      // Avoid infinite loop calling over and over the event
      if (processedEvents.has(event)) return;
      if (isElement(event.target) && element.current?.contains(event.target)) return;
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

  return <div className="highlight-card-wrapper" data-has-query={hasQuery} data-toc-open={isTocOpen === null || isTocOpen} ref={element}>
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
    // These props control the card display modes via data attributes in CSS
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(MaybeWrapper);
