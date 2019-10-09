import Highlighter from '@openstax/highlighter';
import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import isEqual from 'lodash/fp/isEqual';
import { scrollTo } from '../../../utils';
import { SelectedResult } from '../../search/types';
import { highlightResults } from '../../search/utils';
import allImagesLoaded from './allImagesLoaded';

interface Services {
  highlighter: Highlighter;
  container: HTMLElement;
  searchResults?: SearchResultHit[];
  searchResultMap: ReturnType<typeof highlightResults>;
  selected?: SelectedResult | null;
}

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

const updateResults = (services: Services, searchResults: SearchResultHit[]): Services => {
  if (services.searchResults === searchResults) {
    return services;
  }

  services.highlighter.eraseAll();

  const searchResultMap = highlightResults(services.highlighter, searchResults);

  return {...services, searchResultMap};
};

const selectResult = (services: Services, selected: SelectedResult | null): Services => {
  services.highlighter.clearFocus();

  if (selected && services.selected !== selected) {
    scrollToSearch(services, selected);
  }

  return {...services, selected};
};

const searchHighlightManager = (initialServices: Services) =>
  (searchResults: SearchResultHit[], selected: SelectedResult | null) => {
    const newServices = flow(
      (services) => updateResults(services, searchResults),
      (services) => selectResult(services, selected)
    )(initialServices);

    return searchHighlightManager(newServices);
  };

export default (container: HTMLElement) => {
  const services = {
    container,
    highlighter: new Highlighter(container, {
      className: 'search-highlight',
    }),
    searchResultMap: [],
  };

  return searchHighlightManager(services);
};

export const stubManager: ReturnType<typeof searchHighlightManager> = () => stubManager;
