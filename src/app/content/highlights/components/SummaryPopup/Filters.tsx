import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import ChapterFilter from '../../../components/popUp/ChapterFilter';
import ColorFilter from '../../../components/popUp/ColorFilter';
import Filters, { FilterDropdown } from '../../../components/popUp/Filters';
import FiltersList from '../../../components/popUp/FiltersList';
import PrintButton from '../../../components/popUp/PrintButton';
import { highlightStyles } from '../../../constants';
import { printSummaryHighlights, setSummaryFilters } from '../../actions';
import * as select from '../../selectors';

// tslint:disable-next-line:variable-name
export const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    locationFiltersWithContent: select.highlightLocationFiltersWithContent(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(ChapterFilter);

// tslint:disable-next-line: variable-name
export const ConnectedColorFilter = connect(
  (state: AppState) => ({
    colorFiltersWithContent: select.highlightColorFiltersWithContent(state),
    selectedColorFilters: select.summaryColorFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setSummaryFilters: flow(setSummaryFilters, dispatch),
  })
)(ColorFilter);

// tslint:disable-next-line:variable-name
export const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    selectedColorFilters: select.summaryColorFilters(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
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

export default () =>
  <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter />
    </FilterDropdown>
    <FilterDropdown
      label='i18n:highlighting:filters:colors'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ConnectedColorFilter
        styles={highlightStyles}
        labelKey={(label: HighlightColorEnum) => `i18n:highlighting:colors:${label}`}
      />
    </FilterDropdown>
    <ConnectedPrintButton />
    <ConnectedFilterList
      colorAriaLabelKey={() => 'i18n:highlighting:filters:remove:color'}
      colorLabelKey={(label: HighlightColorEnum) => `i18n:highlighting:colors:${label}`}
    />
  </Filters>;
