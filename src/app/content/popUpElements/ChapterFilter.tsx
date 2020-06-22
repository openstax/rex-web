import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../components/AllOrNone';
import Checkbox from '../../components/Checkbox';
import { textStyle } from '../../components/Typography/base';
import { match, not } from '../../fpUtils';
import theme from '../../theme';
import { setSummaryFilters as setSummaryFiltersHL } from '../highlights/actions';
import ColorIndicator from '../highlights/components/ColorIndicator';
import {
  highlightLocationFilters,
  highlightLocationFiltersWithContent,
  myHighlightsOpen,
  summaryLocationFilters as summaryLocationFiltersHL
} from '../highlights/selectors';
import { setSummaryFilters as setSummaryFiltersSG } from '../studyGuides/actions';
import {
  studyGuidesLocationFilters,
  studyGuidesLocationFiltersWithContent,
  studyGuidesOpen,
  summaryLocationFilters as summaryLocationFiltersSG
} from '../studyGuides/selectors';
import { filters } from '../styles/PopupConstants';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${theme.breakpoints.mobile(css`
    flex-direction: column;
    overflow: hidden;
  `)}
`;

// tslint:disable-next-line:variable-name
const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

// tslint:disable-next-line:variable-name
const ChapterTitle = styled.span`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  margin-left: 0.8rem;

  > * {
    overflow: hidden;
  }

  .os-text {
    flex: 1;
    text-overflow: ellipsis;
  }

  .os-divider {
    margin: 0 0.4rem;
  }
`;

const chunk = <T extends any>(sections: T[]) => {
  const cutoff = Math.max(20, Math.ceil(sections.length / 2));
  return [sections.slice(0, cutoff), sections.slice(cutoff)].filter((arr) => arr.length > 0);
};

// tslint:disable-next-line:variable-name
const ChapterFilter = ({className}: Props) => {

  const isMyHighlightsOpen = useSelector(myHighlightsOpen) || false;
  const isStudyGuidesOpen = useSelector(studyGuidesOpen) || false;

  const selectorsForHL = {
    locationFilters: useSelector(highlightLocationFilters),
    locationFiltersWithContent: useSelector(highlightLocationFiltersWithContent),
    selectedLocationFilters: useSelector(summaryLocationFiltersHL),
  };

  const selectorsForSG = {
    locationFilters: useSelector(studyGuidesLocationFilters),
    locationFiltersWithContent: useSelector(studyGuidesLocationFiltersWithContent),
    selectedLocationFilters: useSelector(summaryLocationFiltersSG),
  };

  const currentSelectors = (isMyHighlightsOpen && !isStudyGuidesOpen) ? selectorsForHL : selectorsForSG;
  const currentSetSummaryFilters = (isMyHighlightsOpen && !isStudyGuidesOpen) ?
                                    setSummaryFiltersHL : setSummaryFiltersSG;

  const dispatch = useDispatch();

  const setSelectedChapters = (ids: string[]) => {
    dispatch(currentSetSummaryFilters({locationIds: ids}));
  };

  const handleChange = (id: string) => {
    if (currentSelectors.selectedLocationFilters.has(id)) {
      setSelectedChapters([...currentSelectors.selectedLocationFilters].filter(not(match(id))));
    } else {
      setSelectedChapters([...currentSelectors.selectedLocationFilters, id]);
    }
  };

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedChapters([])}
      onAll={() => setSelectedChapters(Array.from(currentSelectors.locationFiltersWithContent))}
    />
    <Row>
      {chunk(Array.from(currentSelectors.locationFilters.values())).map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((location) => <Checkbox
          key={location.id}
          checked={currentSelectors.selectedLocationFilters.has(location.id)}
          disabled={!currentSelectors.locationFiltersWithContent.has(location.id)}
          onChange={() => handleChange(location.id)}
        >
          <ChapterTitle dangerouslySetInnerHTML={{__html: location.title}} />
        </Checkbox>)}
      </Column>)}
    </Row>
  </div>;
};

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  padding: ${filters.dropdownContent.padding.topBottom}rem ${filters.dropdownContent.padding.sides}rem;
  outline: none;
  overflow: auto;
  z-index: 1;
  ${theme.breakpoints.mobile(css`
    &&& {
      max-width: calc(100vw - ${filters.valueToSubstractFromVW}rem);
    }
  `)}

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
