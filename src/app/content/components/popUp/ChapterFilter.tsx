import React from 'react';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../../components/AllOrNone';
import Checkbox from '../../../components/Checkbox';
import { textStyle } from '../../../components/Typography/base';
import { match, not } from '../../../fpUtils';
import theme from '../../../theme';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { HighlightLocationFilters, SummaryFilters } from '../../highlights/types';
import { PracticeQuestionsLocationFilters } from '../../practiceQuestions/types';
import { filters, mobileMarginSides } from '../../styles/PopupConstants';
import { LinkedArchiveTreeSection } from '../../types';

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

interface CommonProps {
  className?: string;
  disabled?: boolean;
}

interface ChapterFilterWithCheckboxesProps extends CommonProps {
  locationFilters: HighlightLocationFilters;
  locationFiltersWithContent: Set<string>;
  selectedLocationFilters: Set<string>;
  setFilters: (filters: Pick<SummaryFilters, 'locationIds'>) => void;
}

interface ChapterFilterWithTogglingProps extends CommonProps {
  locationFilters: PracticeQuestionsLocationFilters;
  selectedSection: LinkedArchiveTreeSection | null;
  setFilters: (section: LinkedArchiveTreeSection) => void;
}

// tslint:disable-next-line:variable-name
const ChapterFilter = (props: ChapterFilterWithCheckboxesProps | ChapterFilterWithTogglingProps) => {
  if ('locationFiltersWithContent' in props) {
    return <ChapterFilterWithCheckboxes {...props} />;
  }

  return <ChapterFilterWithToggling {...props} />;
};

// tslint:disable-next-line: variable-name
const ChapterFilterWithCheckboxes = (props: ChapterFilterWithCheckboxesProps) => {
  const setSelectedChapters = (ids: string[]) => {
    props.setFilters({locationIds: ids});
  };

  const handleChange = (id: string) => {
    if (props.selectedLocationFilters.has(id)) {
      setSelectedChapters([...props.selectedLocationFilters].filter(not(match(id))));
    } else {
      setSelectedChapters([...props.selectedLocationFilters, id]);
    }
  };

  return <div className={props.className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedChapters([])}
      onAll={() => setSelectedChapters(Array.from(props.locationFiltersWithContent))}
      disabled={props.disabled}
    />
    <Row>
      {chunk(Array.from(props.locationFilters.values())).map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((location) => <Checkbox
          key={location.id}
          checked={props.selectedLocationFilters.has(location.id)}
          disabled={props.disabled || !props.locationFiltersWithContent.has(location.id)}
          onChange={() => handleChange(location.id)}
        >
          <ChapterTitle dangerouslySetInnerHTML={{__html: location.title}} />
        </Checkbox>)}
      </Column>)}
    </Row>
  </div>;
};

// tslint:disable-next-line: variable-name
const StyledDetails = styled.details`
  width: 400px;
  cursor: pointer;
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
`;

// tslint:disable-next-line: variable-name
const StyledSummary = styled.summary`
  display: flex;
  align-items: center;
  height: 4rem;
  outline: none;
  &::marker {
    content: "";
  }
  ${ChapterTitle} {
    margin-left: 1.6rem;
  }
`;

// tslint:disable-next-line: variable-name
const StyledSectionsWrapper = styled.ul`
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line: variable-name
const StyledSectionItem = styled.li`
  display: flex;
  align-items: center;
  height: 4rem;
  ${(props: { isSelected: boolean }) => {
    if (props.isSelected) {
      return 'color: #027eb5;';
    }
  }}
  &:hover {
    background-color: ${theme.color.neutral.pageBackground};
  }
  ${ChapterTitle} {
    padding-left: 2rem;
  }
`;

// tslint:disable-next-line: variable-name
const ChapterFilterWithToggling = (props: ChapterFilterWithTogglingProps) => {
  const [isOpenChapterId, setIsOpenChapterId] = React.useState<string | null>(
    props.selectedSection ? props.selectedSection.parent.id : null
  );

  return <div className={props.className} tabIndex={-1}>
    <Row>
      <Column>
        {Array.from(props.locationFilters.entries()).map(([chapterId, data]) => {
          return <StyledDetails key={chapterId} open={isOpenChapterId === chapterId}>
            <StyledSummary onClick={() => setIsOpenChapterId(chapterId)}>
              <ChapterTitle dangerouslySetInnerHTML={{__html: data.chapter.title}} />
            </StyledSummary>
            <StyledSectionsWrapper>
              {data.sections.map((section) => {
                return <StyledSectionItem
                  onClick={() => props.setFilters(section)}
                  isSelected={props.selectedSection && props.selectedSection.id === section.id}
                  tabIndex={0}
                >
                  <ChapterTitle dangerouslySetInnerHTML={{__html: section.title}} />
                </StyledSectionItem>;
              })}
            </StyledSectionsWrapper>
          </StyledDetails>;
        })}
      </Column>
    </Row>
  </div>;
};

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  padding: ${(props: ChapterFilterWithCheckboxesProps | ChapterFilterWithTogglingProps) => {
    return 'locationFiltersWithContent' in props
      ? `${filters.dropdownContent.padding.topBottom}rem ${filters.dropdownContent.padding.sides}rem`
      : '0';
  }};
  outline: none;
  overflow: auto;
  z-index: 1;

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }

  ${theme.breakpoints.mobileSmall(css`
    width: calc(100vw - ${mobileMarginSides * 2}rem);
  `)}
`;
