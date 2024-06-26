import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import * as Cookies from 'js-cookie';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { loggedOut } from '../../../auth/selectors';
import { useServices } from '../../../context/Services';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import ColorFilter from '../../components/popUp/ColorFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { FiltersChange } from '../../components/popUp/types';
import { SummaryFiltersUpdate } from '../../highlights/types';
import { LinkedArchiveTreeNode } from '../../types';
import { printStudyGuides } from '../actions';
import { highlightStyles } from '../constants';
import * as selectors from '../selectors';
import { updateQueryFromFilterChange } from '../utils';
import { cookieUTG } from './UsingThisGuide/constants';
import UsingThisGuideBanner from './UsingThisGuide/UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';

// converting color to a label is based on "i18n:studyguides:popup:filters:remove:color" from messages.json
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
  })
)(StyledColorFilter);

// tslint:disable-next-line:variable-name
const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
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
  const services = useServices();
  const { dispatch } = services;
  const state = services.getState();

  const toggleUsingThisGuide = () => {
    setUTGopen((toggleState) => !toggleState);
  };

  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:highlighting:filters:chapters'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
        dataAnalyticsLabel='Filter study guides by Chapter'
        controlsId='guide-filter-chapter'
      >
        <ConnectedChapterFilter
          id='guide-filter-chapter'
          disabled={userLoggedOut}
          multiselect={true}
          setFilters={(change: FiltersChange<LinkedArchiveTreeNode>) =>
            updateQueryFromFilterChange(dispatch, state, { locations: change })}
        />
      </FilterDropdown>
      <FilterDropdown
        label='i18n:highlighting:filters:colors'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
        dataAnalyticsLabel='Filter study guides by Color'
        controlsId='guide-filter-color'
      >
        <ConnectedColorFilter
          id='guide-filter-color'
          disabled={userLoggedOut}
          styles={highlightStyles}
          labelKey={(label: HighlightColorEnum) => `i18n:studyguides:popup:filters:${label}`}
          updateSummaryFilters={(change: FiltersChange<HighlightColorEnum>) =>
            updateQueryFromFilterChange(dispatch, state, { colors: change })}
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
      chapterDataAnalyticsLabel={(splitTitle: string) => `Remove breadcrumb for chapter ${splitTitle}`}
      setFilters={(change: SummaryFiltersUpdate) => updateQueryFromFilterChange(dispatch, state, change)}
    />}
  </Filters>;
};
