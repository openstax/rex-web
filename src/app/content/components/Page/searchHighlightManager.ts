import Highlighter from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { AppState } from '../../../types';
import { scrollTo } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import { SelectedResult } from '../../search/types';
import { highlightResults } from '../../search/utils';
import allImagesLoaded from '../utils/allImagesLoaded';

interface Services {
  highlighter: Highlighter;
  container: HTMLElement;
  searchResultMap: ReturnType<typeof highlightResults>;
}

export const mapStateToSearchHighlightProp = (state: AppState) => ({
  searchResults: selectSearch.currentPageResults(state),
  selectedResult: selectSearch.selectedResult(state),
});
type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;

const scrollToSearch = ({container, searchResultMap}: Services, selected: SelectedResult) => {
  const elementHighlights = searchResultMap.find((map) => isEqual(map.result, selected.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selected.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    firstSelectedHighlight.focus();
    allImagesLoaded(container).then(
      () => scrollTo(firstSelectedHighlight.elements[0])
    );
  }
};

const updateResults = (services: Services, previous: HighlightProp, current: HighlightProp) => {
  if (previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();

  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const selectResult = (services: Services, previous: HighlightProp, current: HighlightProp) => {
  if (previous.selectedResult === current.selectedResult || !current.selectedResult) {
    return;
  }

  services.highlighter.clearFocus();
  scrollToSearch(services, current.selectedResult);
};

const handleUpdate = (services: Services) => (previous: HighlightProp, current: HighlightProp) => {
  updateResults(services, previous, current);
  selectResult(services, previous, current);
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
  update: (): void => undefined,
};
