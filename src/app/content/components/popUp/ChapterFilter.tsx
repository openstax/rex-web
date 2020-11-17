import React from 'react';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../../components/AllOrNone';
import { PlainButton } from '../../../components/Button';
import Checkbox from '../../../components/Checkbox';
import { textStyle } from '../../../components/Typography/base';
import { match, not } from '../../../fpUtils';
import theme from '../../../theme';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { filters, mobileMarginSides } from '../../styles/PopupConstants';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../../types';
import { AngleIcon } from './Filters';

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
  overflow-x: hidden;
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

interface DataForToggleSection {
  chapter: LinkedArchiveTree;
  sections: LinkedArchiveTreeSection[];
}

const hasDataForToggleSection = (obj: { [key: string]: any }): obj is DataForToggleSection =>
  Boolean(obj.sections && obj.chapter);

type LocationFilters = Map<
  string,
  LinkedArchiveTree | { chapter: LinkedArchiveTree, sections: LinkedArchiveTreeSection[] }
>;

interface ChapterFilterProps {
  className?: string;
  disabled?: boolean;
  locationFilters: LocationFilters;
  locationFiltersWithContent: Set<string>;
  selectedLocationFilters: Set<string>;
  isOpenChapterId?: string;
  hideAllOrNone?: boolean;
  onChapterToggleClick?: (chapterId: string) => void;
  setFilters: (filters: { locationIds: string[] }) => void;
}

// tslint:disable-next-line:variable-name
const ChapterFilter = (props: ChapterFilterProps) => {
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
    {props.hideAllOrNone
      ? null
      : (
        <AllOrNone
          onNone={() => setSelectedChapters([])}
          onAll={() => setSelectedChapters(Array.from(props.locationFiltersWithContent))}
          disabled={props.disabled}
        />
      )}
    <Row>
      {chunk(Array.from(props.locationFilters.values())).map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((location) => {
          if (!hasDataForToggleSection(location)) {
            return <Checkbox
              key={location.id}
              checked={props.selectedLocationFilters.has(location.id)}
              disabled={props.disabled || !props.locationFiltersWithContent.has(location.id)}
              onChange={() => handleChange(location.id)}
            >
              <ChapterTitle dangerouslySetInnerHTML={{__html: location.title}} />
            </Checkbox>;
          } else {
            const { chapter, sections } = location;
            return <StyledDetails key={chapter.id} open={props.isOpenChapterId === chapter.id}>
              <StyledSummary onClick={(e: React.MouseEvent) => {
                if (props.onChapterToggleClick) {
                  e.preventDefault();
                  props.onChapterToggleClick(chapter.id);
                }
              }}>
                <ChapterTitle dangerouslySetInnerHTML={{__html: chapter.title}} />
                <AngleIcon direction={props.isOpenChapterId === chapter.id ? 'up' : 'down'} />
              </StyledSummary>
              <div>
                {sections.map((section) => {
                  return <StyledSectionItem
                    key={section.id}
                    onClick={() => setSelectedChapters([section.id])}
                    isSelected={props.selectedLocationFilters.has(section.id)}
                  >
                    <ChapterTitle dangerouslySetInnerHTML={{__html: section.title}} />
                  </StyledSectionItem>;
                })}
              </div>
            </StyledDetails>;
          }
        })}
      </Column>)}
    </Row>
  </div>;
};

// tslint:disable-next-line: variable-name
export const StyledDetails = styled.details`
  width: 400px;
  cursor: pointer;
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
  ${theme.breakpoints.mobileSmall(css`
    width: 100%;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StyledSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.6rem;
  height: 4rem;

  &::marker {
    content: "";
  }

  ${ChapterTitle} {
    margin-left: 0;
  }
`;

// tslint:disable-next-line: variable-name
export const StyledSectionItem = styled(PlainButton)`
  display: flex;
  align-items: center;
  height: 4rem;
  width: 100%;
  text-align: left;
  ${(props: { isSelected: boolean }) => {
    if (props.isSelected) {
      return 'color: #027eb5;';
    }
  }}

  &:hover {
    background-color: ${theme.color.neutral.pageBackground};
  }

  ${ChapterTitle} {
    padding-left: 2.5rem;
    width: 95%;
  }
`;

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  ${(props: ChapterFilterProps) => {
    if ('locationFiltersWithContent' in props) {
      return `
        padding: ${filters.dropdownContent.padding.topBottom}rem ${filters.dropdownContent.padding.sides}rem;
      `;
    }
    return `
      padding: 0;
    `;
  }}
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

  ${StyledDetails} {
    &:last-child {
      border-bottom: none;
    }
  }

  ${theme.breakpoints.mobileSmall(css`
    width: calc(100vw - ${mobileMarginSides * 2}rem);
  `)}
`;
