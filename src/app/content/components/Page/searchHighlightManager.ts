import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { scrollTo } from '../../../domUtils';
import { ScrollTargetHighlight } from '../../../navigation/types';
import { AppState } from '../../../types';
import * as selectSearch from '../../search/selectors';
import { highlightResults } from '../../search/utils';

interface Services {
  highlighter: Highlighter;
  container: HTMLElement;
  searchResultMap: ReturnType<typeof highlightResults>;
}

export const mapStateToSearchHighlightProp = (state: AppState) => {
  const searchResults = selectSearch.currentPageResults(state);
  const selectedResult = selectSearch.selectedResult(state);

  return {
    searchResults,
    selectedResult: searchResults && selectedResult && searchResults.find(isEqual(selectedResult.result))
      ? selectedResult
      : null,
  };
};
type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;

interface Options {
  forceRedraw: boolean;
}

const updateResults = (services: Services, previous: HighlightProp, current: HighlightProp, options: Options) => {
  if (!options.forceRedraw && previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();
  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const resultToSelect = (services: Services, previous: HighlightProp, current: HighlightProp, options: Options) => {
  if (!current.selectedResult) {
    return;
  }
  if (!options.forceRedraw && previous.selectedResult === current.selectedResult) {
    return;
  }

  const {selectedResult} = current;

  services.highlighter.clearFocus();

  const elementHighlights = services.searchResultMap.find((map) => isEqual(map.result, selectedResult.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selectedResult.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    firstSelectedHighlight.focus();
  }

  if (firstSelectedHighlight && previous.selectedResult !== current.selectedResult) {
    return firstSelectedHighlight;
  }
};

const handleUpdate = (services: Services) => (previous: HighlightProp, current: HighlightProp, options: Options) => {
  updateResults(services, previous, current, options);
  return resultToSelect(services, previous, current, options);
};

const searchHighlightManager = (container: HTMLElement) => {
  const services = {
    container,
    highlighter: new Highlighter(container, {
      className: 'search-highlight',
    }),
    searchResultMap: [],
  };

  return {
    getScrollTarget: (
      previous: HighlightProp, current: HighlightProp, options: Options
    ): ScrollTargetHighlight | null => {
      const searchResultHighlight = handleUpdate(services)(previous, current, options);
      if (!searchResultHighlight) { return null; }

      return {
        id: searchResultHighlight.id,
        scrollToFunction: () => scrollTo(
          searchResultHighlight.elements[0] as HTMLElement
        ),
        type: 'search-highlight',
      };
    },
    unmount: () => services.highlighter.unmount(),
    update: handleUpdate(services),
  };
};

export default searchHighlightManager;

export const stubManager: ReturnType<typeof searchHighlightManager> = {
  getScrollTarget: (): ScrollTargetHighlight | null => null,
  unmount: (): void => undefined,
  update: (): Highlight | undefined => undefined,
};
