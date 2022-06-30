import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { useServices } from '../../../../context/Services';
import { updateQueryFromFilterChange } from '../../../../navigation/utils';
import { AppState, Dispatch } from '../../../../types';
import ChapterFilter from '../../../components/popUp/ChapterFilter';
import ColorFilter from '../../../components/popUp/ColorFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../../components/popUp/Filters';
import FiltersList from '../../../components/popUp/FiltersList';
import PrintButton from '../../../components/popUp/PrintButton';
import { FiltersChange } from '../../../components/popUp/types';
import { highlightStyles } from '../../../constants';
import { LinkedArchiveTreeNode } from '../../../types';
import { printSummaryHighlights } from '../../actions';
import * as select from '../../selectors';
import { SummaryFiltersUpdate } from '../../types';

// tslint:disable-next-line:variable-name
export const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    locationFiltersWithContent: select.highlightLocationFiltersWithContent(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  })
)(ChapterFilter);

// tslint:disable-next-line: variable-name
export const ConnectedColorFilter = connect(
  (state: AppState) => ({
    colorFiltersWithContent: select.highlightColorFiltersWithContent(state),
    selectedColorFilters: select.summaryColorFilters(state),
  })
)(ColorFilter);

// tslint:disable-next-line:variable-name
export const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    selectedColorFilters: select.summaryColorFilters(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
export const ConnectedPrintButton = connect(
  (state: AppState) => ({
    disabled: select.summaryIsLoading(state),
    loading: select.summaryIsLoading(state),
    shouldFetchMore: select.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printSummaryHighlights, dispatch),
  }),
  (stateProps, dispatchProps, ownProps) => {
    const {shouldFetchMore, loadHighlightsAndPrint, ...props} = {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
    };

    return shouldFetchMore
      ? {...props, onClick: loadHighlightsAndPrint}
      : props
    ;
  }
)(PrintButton);

export default () => {
  const services = useServices();
  const { dispatch } = services;
  const state = services.getState();
  const summaryFilters = select.summaryFilters(state);

  return (
    <Filters>
      <FiltersTopBar>
        <FilterDropdown
          label='i18n:highlighting:filters:chapters'
          ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
          dataAnalyticsLabel='Filter highlights by Chapter'
        >
          <ConnectedChapterFilter
            multiselect={true}
            setFilters={(change: FiltersChange<LinkedArchiveTreeNode>) =>
              updateQueryFromFilterChange(dispatch, state, summaryFilters, { locations: change })}
          />
        </FilterDropdown>
        <FilterDropdown
          label='i18n:highlighting:filters:colors'
          ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
          dataAnalyticsLabel='Filter highlights by Color'
        >
          <ConnectedColorFilter
            styles={highlightStyles}
            labelKey={(label: HighlightColorEnum) => `i18n:highlighting:colors:${label}`}
            updateSummaryFilters={(change: FiltersChange<HighlightColorEnum>) =>
              updateQueryFromFilterChange(dispatch, state, summaryFilters, { colors: change })}
          />
        </FilterDropdown>
        <ConnectedPrintButton />
      </FiltersTopBar>
      <ConnectedFilterList
        colorAriaLabelKey={() => 'i18n:highlighting:filters:remove:color'}
        colorDataAnalyticsLabel={(color: HighlightColorEnum) => `Remove breadcrumb for color ${color}`}
        colorLabelKey={(color: HighlightColorEnum) => `i18n:highlighting:colors:${color}`}
        chapterAriaLabelKey={() => 'i18n:highlighting:filters:remove:chapter'}
        chapterDataAnalyticsLabel={(splitTitle: string) => `Remove breadcrumb for chapter ${splitTitle}`}
        setFilters={(change: SummaryFiltersUpdate) =>
          updateQueryFromFilterChange(dispatch, state, summaryFilters, change)
        }
      />
    </Filters>);
};
