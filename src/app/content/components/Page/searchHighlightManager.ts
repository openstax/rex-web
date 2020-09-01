import Highlighter from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { AppState } from '../../../types';
import { memoizeStateToProps } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import { highlightResults } from '../../search/utils';

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
    selectedResult: searchResults && selectedResult && searchResults.find(isEqual(selectedResult.result))
      ? selectedResult
      : null,
  };
});
export type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;
interface UpdateResult {
  scrollTarget?: HTMLElement;
}

interface Options {
  forceRedraw: boolean;
  clearError: () => void;
  setError: (id: string) => void;
}

const updateResults = (services: Services, previous: HighlightProp, current: HighlightProp, options: Options) => {
  if (!options.forceRedraw && previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();
  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const selectResult = (
  services: Services,
  previous: HighlightProp,
  current: HighlightProp,
  options: Options
): UpdateResult => {
  if (!current.selectedResult) {
    options.clearError();
    return {};
  }
  if (!options.forceRedraw && previous.selectedResult === current.selectedResult) {
    return {};
  }

  const {selectedResult} = current;

  services.highlighter.clearFocus();

  const elementHighlights = services.searchResultMap.find((map) => isEqual(map.result, selectedResult.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selectedResult.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    firstSelectedHighlight.focus();
    options.clearError();
  } else {
    const currentResultId = `${current.selectedResult.highlight}-${current.selectedResult.result.source.pageId}`;
    options.setError(currentResultId);
  }

  if (firstSelectedHighlight && previous.selectedResult !== current.selectedResult) {
    return {scrollTarget: firstSelectedHighlight.elements[0] as HTMLElement};
  }
  return {};
};

const handleUpdate = (services: Services) => (previous: HighlightProp, current: HighlightProp, options: Options) => {
  updateResults(services, previous, current, options);
  return selectResult(services, previous, current, options) as {scrollTarget?: HTMLElement};
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
    unmount: () => services.highlighter.unmount(),
    update: handleUpdate(services),
  };
};

export default searchHighlightManager;

export const stubManager: ReturnType<typeof searchHighlightManager> = {
  unmount: (): void => undefined,
  update: (): {scrollTarget?: HTMLElement} => ({}),
};
