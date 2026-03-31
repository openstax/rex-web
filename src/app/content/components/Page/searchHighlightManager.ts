import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { IntlShape } from 'react-intl';
import { AppState } from '../../../types';
import { memoizeStateToProps } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import { highlightResults } from '../../search/utils';
import { expandClosestSolution } from '../../utils/domUtils';
import allImagesLoaded from '../utils/allImagesLoaded';

interface Services {
  highlighter: Highlighter;
  container: HTMLElement;
  searchResultMap: ReturnType<typeof highlightResults>;
}

export const mapStateToSearchHighlightProp = memoizeStateToProps((state: AppState) => {
  const searchResults = selectSearch.currentPageResults(state);
  const selectedResult = selectSearch.selectedResult(state);

  return {
    searchResults,
    selectedResult: selectedResult && searchResults?.find(isEqual(selectedResult.result))
      ? selectedResult
      : null,
  };
});
export type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;

export interface UpdateOptions {
  forceRedraw: boolean;
  onSelect: (selectedHighlight?: Highlight) => void;
}

const updateResults = (
  services: Services,
  previous: HighlightProp | null,
  current: HighlightProp,
  options: UpdateOptions) => {
  if (!options.forceRedraw && previous && previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();
  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const selectResult = (
  services: Services,
  previous: HighlightProp | null,
  current: HighlightProp,
  options: UpdateOptions) => {
  if (!current.selectedResult) {
    return;
  }
  if (!options.forceRedraw && previous && previous.selectedResult === current.selectedResult) {
    return;
  }

  const {selectedResult} = current;

  services.highlighter.clearFocusedStyles();

  const elementHighlights = services.searchResultMap.find((map) => isEqual(map.result, selectedResult.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selectedResult.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    // If selected result is in the collapsed solution then expand it
    expandClosestSolution(firstSelectedHighlight.elements[0] as HTMLElement);
    firstSelectedHighlight.addFocusedStyles();
  }

  if (previous && previous.selectedResult === current.selectedResult) { return; }

  const selectedElements = firstSelectedHighlight?.elements;

  if (selectedElements && selectedElements.length > 0) {
    allImagesLoaded(services.container).then(
      () => {
        const target = selectedElements[0] as HTMLElement;
        const focusTarget: HTMLElement | null = target.querySelector('[tabindex="0"],[tabindex="-1"]');

        focusTarget?.focus();
      }
    );
  }

  options.onSelect(firstSelectedHighlight);
};

const handleUpdate = (services: Services) => (
  previous: HighlightProp | null,
  current: HighlightProp,
  options: UpdateOptions
) => {
  updateResults(services, previous, current, options);
  selectResult(services, previous, current, options);
};

const createHighlighter = (container: HTMLElement, intl: IntlShape) =>
  new Highlighter(container, {
    className: 'search-highlight',
    formatMessage: ({ id }) => intl.formatMessage({ id: `${id}:search` }),
    tabbable: false,
  });

const searchHighlightManager = (container: HTMLElement, intl: IntlShape) => {
  const services: Services = {
    container,
    highlighter: createHighlighter(container, intl),
    searchResultMap: [],
  };

  return {
    // Replace the Highlighter instance without trying to unwrap orphaned DOM
    // nodes. Call this after user highlight changes have already removed or
    // restructured the shared DOM — the old search highlight spans are gone,
    // so we just need to forget about them and re-highlight from scratch.
    resetHighlighter: () => {
      services.highlighter.unmount();
      services.highlighter = createHighlighter(container, intl);
      services.searchResultMap = [];
    },
    unmount: () => services.highlighter.unmount(),
    update: handleUpdate(services),
  };
};

export default searchHighlightManager;

export const stubManager: ReturnType<typeof searchHighlightManager> = {
  resetHighlighter: (): void => undefined,
  unmount: (): void => undefined,
  update: (): void => undefined,
};
