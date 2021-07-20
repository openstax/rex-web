import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { IntlShape } from 'react-intl';
import { scrollTo } from '../../../domUtils';
import { AppState } from '../../../types';
import { memoizeStateToProps } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import { highlightResults } from '../../search/utils';
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
    selectedResult: searchResults && selectedResult && searchResults.find(isEqual(selectedResult.result))
      ? selectedResult
      : null,
  };
});
export type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;

export interface UpdateOptions {
  forceRedraw: boolean;
  onSelect: (selectedHighlight?: Highlight) => void;
}

const updateResults = (services: Services, previous: HighlightProp, current: HighlightProp, options: UpdateOptions) => {
  if (!options.forceRedraw && previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();
  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const selectResult = (services: Services, previous: HighlightProp, current: HighlightProp, options: UpdateOptions) => {
  if (!current.selectedResult) {
    return;
  }
  if (!options.forceRedraw && previous.selectedResult === current.selectedResult) {
    return;
  }

  const {selectedResult} = current;

  services.highlighter.clearFocusedStyles();

  const elementHighlights = services.searchResultMap.find((map) => isEqual(map.result, selectedResult.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selectedResult.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    // If selected result is in the collapsed solution then expand it
    const solution = (firstSelectedHighlight.elements[0] as HTMLElement)
      .closest('[data-type="solution"][aria-expanded="false"]');
    if (solution) {
      const button = solution.querySelector('button');
      button?.click();
    }

    firstSelectedHighlight.addFocusedStyles();
  }

  if (previous.selectedResult === current.selectedResult) { return; }

  if (firstSelectedHighlight) {
    allImagesLoaded(services.container).then(
      () => scrollTo(firstSelectedHighlight.elements[0] as HTMLElement)
    );
  }

  options.onSelect(firstSelectedHighlight);
};

const handleUpdate = (services: Services) => (
  previous: HighlightProp,
  current: HighlightProp,
  options: UpdateOptions
) => {
  updateResults(services, previous, current, options);
  selectResult(services, previous, current, options);
};

const searchHighlightManager = (container: HTMLElement, intl: IntlShape) => {
  const services = {
    container,
    highlighter: new Highlighter(container, {
      className: 'search-highlight',
      formatMessage: ({ id }) => intl.formatMessage({ id }, { style: 'search' }),
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
  update: (): void => undefined,
};
