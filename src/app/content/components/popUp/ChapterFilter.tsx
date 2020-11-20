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

export type LocationFilters = Map<
  string,
  { section: LinkedArchiveTree | LinkedArchiveTreeSection, children?: LinkedArchiveTreeSection[] }
>;

interface ChapterFilterProps {
  className?: string;
  disabled?: boolean;
  locationFilters: LocationFilters;
  locationFiltersWithContent: Set<string>;
  selectedLocationFilters: Set<string>;
  multiselect: boolean;
  setFilters: (filters: { locationIds: string[] }) => void;
}

// tslint:disable-next-line:variable-name
const ChapterFilter = (props: ChapterFilterProps) => {
  const [isOpenChapterId, setIsOpenChapterId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const selectedSectionId = Array.from(props.selectedLocationFilters).pop();
    if (selectedSectionId) {
      const filterWithSelectedSection = Array.from(props.locationFilters.values()).find(({ children }) => {
        return children && children.find((section) => section.id === selectedSectionId);
      });
      if (filterWithSelectedSection) {
        setIsOpenChapterId(filterWithSelectedSection.section.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const values = Array.from(props.locationFilters.values());
  const hasFiltersWithChildren = Boolean(values.find((filter) => filter.children));
  const sectionChunks = hasFiltersWithChildren ? [values] : chunk(values);

  return <div className={props.className} tabIndex={-1}>
    {props.multiselect
      ? (
        <AllOrNone
          onNone={() => setSelectedChapters([])}
          onAll={() => setSelectedChapters(Array.from(props.locationFiltersWithContent))}
          disabled={props.disabled}
        />
      )
      : null}
    <Row>
      {sectionChunks.map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((location) => {
          const { section, children } = location;
          if (!children) {
            return <ChapterFilterItem
              key={section.id}
              selected={props.selectedLocationFilters.has(section.id)}
              disabled={props.disabled || !props.locationFiltersWithContent.has(section.id)}
              multiselect={Boolean(props.multiselect)}
              title={section.title}
              onChange={() => handleChange(section.id)}
            />;
          } else {
            return <StyledDetails key={section.id} open={isOpenChapterId === section.id}>
              <StyledSummary onClick={(ev: React.MouseEvent) => {
                ev.preventDefault();
                setIsOpenChapterId((currentId) => currentId !== section.id ? section.id : null);
              }}>
                <ChapterTitle dangerouslySetInnerHTML={{__html: section.title}} />
                <AngleIcon direction={isOpenChapterId === section.id ? 'up' : 'down'} />
              </StyledSummary>
              <div>
                {children.map((child) => (
                  <ChapterFilterItem
                    key={child.id}
                    selected={props.selectedLocationFilters.has(child.id)}
                    disabled={false}
                    multiselect={props.multiselect}
                    title={child.title}
                    onChange={() => handleChange(child.id)}
                  />
                ))}
              </div>
            </StyledDetails>;
          }
        })}
      </Column>)}
    </Row>
  </div>;
};

interface ChapterFilterItemProps {
  selected: boolean;
  disabled: boolean;
  multiselect: boolean;
  title: string;
  onChange: () => void;
}

// tslint:disable-next-line: variable-name
const ChapterFilterItem = (props: ChapterFilterItemProps) => {
  if (props.multiselect) {
    return <Checkbox
      checked={props.selected}
      disabled={props.disabled}
      onChange={props.onChange}
    >
      <ChapterTitle dangerouslySetInnerHTML={{__html: props.title}} />
    </Checkbox>;
  }

  return <StyledSectionItem
    onClick={props.onChange}
    isSelected={props.selected}
  >
    <ChapterTitle dangerouslySetInnerHTML={{__html: props.title}} />
  </StyledSectionItem>;
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
