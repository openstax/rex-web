import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../../components/AllOrNone';
import { PlainButton } from '../../../components/Button';
import Checkbox from '../../../components/Checkbox';
import { textStyle } from '../../../components/Typography/base';
import { useTrapTabNavigation } from '../../../reactUtils/focusUtils';
import theme from '../../../theme';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { filters, mobileMarginSides } from '../../styles/PopupConstants';
import { LinkedArchiveTreeNode } from '../../types';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { AngleIcon, Fieldset } from './Filters';
import { FiltersChange, LocationFilters } from './types';
import { linkColor, linkHover } from '../../../components/Typography';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${theme.breakpoints.mobile(css`
    flex-direction: column;
    overflow: hidden;
  `)}
`;

const Column = styled.ul`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  list-style: none;
  margin: 0;
  padding: 0;
`;

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

function chunk<T>(sections: T[]) {
  const cutoff = Math.max(20, Math.ceil(sections.length / 2));
  return [sections.slice(0, cutoff), sections.slice(cutoff)].filter((arr) => arr.length > 0);
}

interface ChapterFilterProps {
  ariaLabelItemId?: string;
  className?: string;
  disabled?: boolean;
  locationFilters: LocationFilters;
  locationFiltersWithContent: Map<string, LinkedArchiveTreeNode>;
  selectedLocationFilters: Set<string>;
  multiselect: boolean;
  setFilters: (filters: FiltersChange<LinkedArchiveTreeNode>) => void;
  id: string;
}

const ChapterFilter = (props: ChapterFilterProps) => {
  const [openChapterId, setOpenChapterId] = React.useState<string | null>(null);
  const intl = useIntl();
  const ref = React.useRef<HTMLElement>(null);
  useTrapTabNavigation(ref);

  React.useEffect(() => {
    const selectedSectionId = Array.from(props.selectedLocationFilters).pop();
    if (selectedSectionId) {
      const filterWithSelectedSection = Array.from(props.locationFilters.values()).find(({ children }) => {
        return children && children.find((section) => section.id === selectedSectionId);
      });
      if (filterWithSelectedSection) {
        setOpenChapterId(filterWithSelectedSection.section.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedChapters = (change: FiltersChange<LinkedArchiveTreeNode>) => {
    props.setFilters(change);
  };

  const handleChange = (section: LinkedArchiveTreeNode) => {
    if (props.selectedLocationFilters.has(section.id)) {
      setSelectedChapters({ remove: [section], new: [] });
    } else {
      setSelectedChapters({ remove: [], new: [section] });
    }
  };

  const getAriaLabel = (section: LinkedArchiveTreeNode) => {
    if (props.ariaLabelItemId) {
      return intl.formatMessage({ id: props.ariaLabelItemId }, { filter: splitTitleParts(section.title).join(' ') });
    }
  };

  const values = Array.from(props.locationFilters.values());
  const hasFiltersWithChildren = Boolean(values.find((filter) => filter.children));
  const sectionChunks = hasFiltersWithChildren ? [values] : chunk(values);

  return <div className={props.className} tabIndex={-1} id={props.id} ref={ref}>
    {props.multiselect
      ? (
        <AllOrNone
          onNone={() => setSelectedChapters({ remove: Array.from(props.locationFiltersWithContent.values()), new: [] })}
          onAll={() => setSelectedChapters({ remove: [], new: Array.from(props.locationFiltersWithContent.values()) })}
          disabled={props.disabled}
        />
      )
      : null}
    <Fieldset>
      <legend>Filter by chapters</legend>
      <Row>
        {sectionChunks.map((sectionChunk, index) => <Column key={index} aria-label='Filter by chapters'>
          {sectionChunk.map((location) => {
            const { section, children } = location;
            if (!children) {
              return <li key={section.id}><ChapterFilterItem
                selected={props.selectedLocationFilters.has(section.id)}
                disabled={props.disabled || !props.locationFiltersWithContent.has(section.id)}
                multiselect={Boolean(props.multiselect)}
                title={section.title}
                onChange={() => handleChange(section)}
                ariaLabel={getAriaLabel(section)}
                dataAnalyticsLabel={`Filter PQ by ${splitTitleParts(section.title).join(' ')}`}
              /></li>;
            } else {
              return <li key={section.id}><StyledDetails open={openChapterId === section.id}>
                <StyledSummary onClick={(ev: React.MouseEvent) => {
                  ev.preventDefault();
                  setOpenChapterId((currentId) => currentId !== section.id ? section.id : null);
                }}>
                  <ChapterTitle dangerouslySetInnerHTML={{ __html: section.title }} />
                  <AngleIcon direction={openChapterId === section.id ? 'up' : 'down'} />
                </StyledSummary>
                <StyledChapterFilterItemWrapper>
                  {children.map((child) => (
                    <ChapterFilterItem
                      key={child.id}
                      selected={props.selectedLocationFilters.has(child.id)}
                      disabled={false}
                      multiselect={props.multiselect}
                      title={child.title}
                      onChange={() => handleChange(child)}
                      ariaLabel={getAriaLabel(child)}
                      dataAnalyticsLabel={`Filter PQ by ${splitTitleParts(child.title).join(' ')}`}
                    />
                  ))}
                </StyledChapterFilterItemWrapper>
              </StyledDetails></li>;
            }
          })}
        </Column>)}
      </Row>
    </Fieldset>
  </div>;
};

interface ChapterFilterItemProps {
  selected: boolean;
  disabled: boolean;
  multiselect: boolean;
  title: string;
  ariaLabel?: string;
  dataAnalyticsLabel: string;
  onChange: () => void;
}

const ChapterFilterItem = (props: ChapterFilterItemProps) => {
  if (props.multiselect) {
    return <Checkbox
      checked={props.selected}
      disabled={props.disabled}
      onChange={props.onChange}
      aria-label={props.ariaLabel}
      aria-selected={props.selected}
    >
      <ChapterTitle dangerouslySetInnerHTML={{ __html: props.title }} />
    </Checkbox>;
  }

  return <StyledSectionItem
    onClick={props.onChange}
    aria-label={props.ariaLabel}
    data-analytics-label={props.dataAnalyticsLabel}
    aria-current={props.selected ? 'true' : undefined}
  >
    <ChapterTitle dangerouslySetInnerHTML={{ __html: props.title }} />
  </StyledSectionItem>;
};

export const StyledDetails = styled.details`
  width: 400px;
  cursor: pointer;
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
  overflow: visible;
  ${theme.breakpoints.mobileSmall(css`
    width: 100%;
  `)}
`;

export const StyledSummary = styled.summary`
  padding: 1rem 1.6rem;
  list-style: none;

  &::marker,
  &::-webkit-details-marker {
    content: "";
    display: none;
  }

  ${ChapterTitle} {
    float: left;
    margin-left: 0;
    text-align: left;
  }

  ${AngleIcon} {
    float: right;
  }
`;

export const StyledSectionItem = styled(PlainButton)`
  display: flex;
  align-items: center;
  height: 4rem;
  width: 100%;
  text-align: left;
  font-size: 1.4rem;
  ${textStyle}

  &[aria-current="true"] {
    color: ${linkColor};
  }

  &:hover,
  &:focus {
    background-color: ${theme.color.neutral.pageBackground};
    color: ${linkHover};
  }

  ${ChapterTitle} {
    padding-left: 2.5rem;
    width: 95%;
  }
`;

export const StyledChapterFilterItemWrapper = styled.div`
  overflow: visible;
`;

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  padding: ${filters.dropdownContent.padding.topBottom}rem ${filters.dropdownContent.padding.sides}rem;
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
