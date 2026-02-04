/* eslint-disable no-console */
import Highlighter, { Highlight } from '@openstax/highlighter';
import { FocusEvent, HTMLElement, KeyboardEvent, MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { createPortal } from 'react-dom';
import { connect, useSelector } from 'react-redux';
import flow from 'lodash/fp/flow';
import { clearFocusedHighlight } from '../actions';
import ResizeObserver from 'resize-observer-polyfill';
import styled from 'styled-components';
import { isHtmlElement } from '../../../guards';
import { useKeyCombination, useFocusHighlight, useOnEsc } from '../../../reactUtils';
import { AppState, Dispatch } from '../../../types';
import { assertDefined, assertDocument, stripHtml } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { highlightKeyCombination } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { editCardVisibilityHandler, getHighlightOffset, noopKeyCombinationHandler, updateCardsPositions } from './cardUtils';
import {
  injectPortalContainer,
  removePortalContainer,
  getPortalContainerForHighlight,
  PORTAL_ATTR,
} from './utils/portalContainer';

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
    const handler = () => {
      console.debug('[showCardEvent] setShouldFocusCard(true)');
      setShouldFocusCard(true);
    };

    document.addEventListener('showCardEvent', handler);
    return () => document.removeEventListener('showCardEvent', handler);
  }, [document]);

  // Catches escape in Textarea to hide card
  React.useEffect(() => {
    const handler = () => {
      console.debug('[hideCardEvent] setShouldFocusCard(false)');
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

  // Manage portal container cleanup for focused highlights
  const previousFocusedIdRef = React.useRef<string | undefined>();
  React.useEffect(() => {
    const previousFocusedId = previousFocusedIdRef.current;

    if (previousFocusedId && previousFocusedId !== focusedId) {
      removePortalContainer(previousFocusedId);
    }

    previousFocusedIdRef.current = focusedId;

    return () => {
      if (focusedId) {
        removePortalContainer(focusedId);
      }
    };
  }, [focusedId]);

  // Pressing Enter moves the users from a highlight to the editor
  const editOnEnter = React.useCallback(() => {
    if (focusedHighlight) {
      setShouldFocusCard(true);
    }
  }, [focusedHighlight]);

  // Watch for selection change when the highlight is just a selection
  // if selection becomes empty, clear the focusedHighlight
  // But don't clear if focus is inside the card (e.g., user tabbed into it)
  React.useEffect(() => {
    let pendingCheck: ReturnType<typeof setTimeout> | null = null;

    const handler = () => {
      const selection = document.getSelection();

      if (!isExistingHighlight && selection?.isCollapsed) {
        // Defer the check - when Tab is pressed, selectionchange fires BEFORE
        // focus moves to the new element. Use setTimeout to wait for focus to settle.
        if (pendingCheck) {
          clearTimeout(pendingCheck);
        }
        pendingCheck = setTimeout(() => {
          pendingCheck = null;
          const activeElement = document.activeElement as HTMLElement | null;
          console.debug('[selectionchange deferred]', {
            isExistingHighlight,
            isCollapsed: document.getSelection()?.isCollapsed,
            activeElement: activeElement?.tagName,
            activeElementId: activeElement?.id,
            isInCard: !!activeElement?.closest('[data-highlight-card]'),
            isInPortal: !!activeElement?.closest(`[${PORTAL_ATTR}]`),
          });

          // Re-check selection is still collapsed (might have changed)
          if (!document.getSelection()?.isCollapsed) {
            console.debug('[selectionchange deferred] selection no longer collapsed, skipping');
            return;
          }

          // Check if focus is inside the card or a portal container
          if (activeElement) {
            const isInCard = activeElement.closest('[data-highlight-card]');
            const isInPortal = activeElement.closest(`[${PORTAL_ATTR}]`);
            if (isInCard || isInPortal) {
              console.debug('[selectionchange deferred] focus in card/portal, not clearing');
              return;
            }
          }
          console.debug('[selectionchange deferred] CLEARING - unfocus + setShouldFocusCard(false)');
          unfocus();
          setShouldFocusCard(false);
        }, 350); // 50ms delay to let Tab keypress fully process
      }
    };

    document.addEventListener('selectionchange', handler);
    return () => {
      document.removeEventListener('selectionchange', handler);
      if (pendingCheck) {
        clearTimeout(pendingCheck);
      }
    };
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

  // Handle focus lost - but don't clear if focus moved to a portal-rendered card
  const handleFocusOut = React.useCallback((event: FocusEvent) => {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    console.debug('[focusout]', {
      relatedTarget: relatedTarget?.tagName,
      relatedTargetId: relatedTarget?.id,
      isInCard: !!relatedTarget?.closest('[data-highlight-card]'),
      isInPortal: !!relatedTarget?.closest(`[${PORTAL_ATTR}]`),
    });

    // Check if focus moved to a portal container or card inside one
    if (relatedTarget) {
      const portalContainer = relatedTarget.closest(`[${PORTAL_ATTR}]`);
      const isInCard = relatedTarget.closest('[data-highlight-card]');
      if (portalContainer || isInCard) {
        console.debug('[focusout] focus in card/portal, not clearing');
        return;
      }
    }

    console.debug('[focusout] CLEARING - setShouldFocusCard(false)');
    setShouldFocusCard(false);
  }, []);

  React.useEffect(() => {
    const el = element.current;
    if (!el || !shouldFocusCard || !isExistingHighlight) { return; }

    el.addEventListener('focusout', handleFocusOut);
    return () => el.removeEventListener('focusout', handleFocusOut);
  }, [element, shouldFocusCard, isExistingHighlight, handleFocusOut]);

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
  useKeyCombination({key: 'Enter'}, () => showCard(focusedHighlight?.id), undefined, false);

  // Allow to hide EditCard using Escape key
  useOnEsc(true, hideCard);
  useFocusHighlight(showCard, highlights);

  // Render cards - focused card goes through portal for natural tab order
  console.debug('[CardsForHighlights render]', {
    focusedId: focusedHighlight?.id,
    shouldFocusCard,
    highlightCount: highlights.length,
  });

  return <>
    {highlights.map((highlight, index) => {
      const isFocused = focusedHighlight === highlight;
      const focusThisCard = shouldFocusCard && isFocused;
      // Inject portal container synchronously during render so it exists before first card render.
      // This prevents the card from switching from direct render to portal render mid-session.
      const portalContainer = isFocused
        ? injectPortalContainer(highlight) ?? getPortalContainerForHighlight(highlight.id)
        : null;

      if (isFocused) {
        console.debug('[CardsForHighlights] focused card', {
          highlightId: highlight.id,
          focusThisCard,
          hasPortalContainer: !!portalContainer,
        });
      }

      const cardElement = (
        <Card
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
          usePortal={!!portalContainer}
        />
      );

      // Render focused card via portal for natural tab order
      if (portalContainer) {
        return createPortal(cardElement, portalContainer);
      }

      return cardElement;
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
