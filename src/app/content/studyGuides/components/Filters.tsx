import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import * as Cookies from 'js-cookie';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { loggedOut } from '../../../auth/selectors';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import ColorFilter from '../../components/popUp/ColorFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { FiltersChange } from '../../components/popUp/types';
import { SummaryFiltersUpdate } from '../../highlights/types';
import { LinkedArchiveTreeNode } from '../../types';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { printStudyGuides, updateSummaryFilters } from '../actions';
import { highlightStyles } from '../constants';
import * as selectors from '../selectors';
import { cookieUTG } from './UsingThisGuide/constants';
import UsingThisGuideBanner from './UsingThisGuide/UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';

const createColorDataAnalyticsLabel = (color: HighlightColorEnum): string => {
  let label;
  switch (color) {
    case 'blue':
      label = 'Important Concepts';
      break;
    case 'green':
      label = 'Connections & Relationships';
      break;
    case 'purple':
      label = 'Enrichment';
      break;
    case 'yellow':
      label = 'Key Terms';
      break;
  }

  return `Remove breadcrumb for label ${label}`;
};

// tslint:disable-next-line:variable-name
const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    locationFiltersWithContent: selectors.studyGuidesLocationFiltersWithContent(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: (change: FiltersChange<LinkedArchiveTreeNode>) => dispatch(updateSummaryFilters({ locations: change })),
  })
)(ChapterFilter);

// tslint:disable-next-line: variable-name
const StyledColorFilter = styled(ColorFilter)`
  min-width: 29rem;
`;

// tslint:disable-next-line: variable-name
const RightButtonsWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  overflow: visible;
`;

// tslint:disable-next-line: variable-name
const ConnectedColorFilter = connect(
  (state: AppState) => ({
    colorFiltersWithContent: selectors.highlightColorFiltersWithContent(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
  }),
  (dispatch: Dispatch) => ({
    updateSummaryFilters: (change: FiltersChange<HighlightColorEnum>) =>
      dispatch(updateSummaryFilters({ colors: change })),
  })
)(StyledColorFilter);

// tslint:disable-next-line:variable-name
const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: (change: SummaryFiltersUpdate) => dispatch(updateSummaryFilters(change)),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
const ConnectedPrintButton = connect(
  (state: AppState) => ({
    disabled: selectors.summaryIsLoading(state),
    loading: selectors.summaryIsLoading(state),
    shouldFetchMore: selectors.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printStudyGuides, dispatch),
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
  const userLoggedOut = useSelector(loggedOut);
  const [isUTGopen, setUTGopen] = React.useState(!Cookies.get(cookieUTG));

  const toggleUsingThisGuide = () => {
    setUTGopen((state) => !state);
  };

  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:highlighting:filters:chapters'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
        dataAnalyticsLabel='Filter study guides by Chapter'
      >
        <ConnectedChapterFilter disabled={userLoggedOut} multiselect={true} />
      </FilterDropdown>
      <FilterDropdown
        label='i18n:highlighting:filters:colors'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
        dataAnalyticsLabel='Filter study guides by Color'
      >
        <ConnectedColorFilter
          disabled={userLoggedOut}
          styles={highlightStyles}
          labelKey={(label: HighlightColorEnum) => `i18n:studyguides:popup:filters:${label}`}
        />
      </FilterDropdown>
      <RightButtonsWrapper>
        <ConnectedPrintButton studyGuidesButton />
        <UsingThisGuideButton onClick={toggleUsingThisGuide} open={isUTGopen}/>
      </RightButtonsWrapper>
    </FiltersTopBar>
    <UsingThisGuideBanner
      onClick={toggleUsingThisGuide}
      show={isUTGopen}
    />
    {!userLoggedOut && <ConnectedFilterList
      colorAriaLabelKey={() => 'i18n:studyguides:popup:filters:remove:color'}
      colorDataAnalyticsLabel={(color: HighlightColorEnum) => createColorDataAnalyticsLabel(color)}
      colorLabelKey={(color: HighlightColorEnum) => `i18n:studyguides:popup:filters:${color}`}
      chapterAriaLabelKey={() => 'i18n:studyguides:popup:filters:remove:chapter'}
      chapterDataAnalyticsLabel={(title: string) => `Remove breadcrumb for chapter ${splitTitleParts(title).join(' ')}`}
    />}
  </Filters>;
};
