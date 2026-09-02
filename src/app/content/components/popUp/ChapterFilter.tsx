import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import AllOrNone from '../../../components/AllOrNone';
import { PlainButton } from '../../../components/Button';
import Checkbox from '../../../components/Checkbox';
import { useTrapTabNavigation } from '../../../reactUtils/focusUtils';
import { LinkedArchiveTreeNode } from '../../types';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { AngleIcon, Fieldset } from './Filters';
import { FiltersChange, LocationFilters, LocationFiltersWithChildren } from './types';
import './ChapterFilter.css';

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className='chapter-filter-row'>{children}</div>
);

const Column = ({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={classNames('chapter-filter-column', className)} {...props}>{children}</ul>
);

const ChapterTitle = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={classNames('chapter-filter-title', className)} {...props} />
);

// only reachable for the ChapterFilterWithoutContentProps shape below, where
// nothing reads it. Shared so the fallback doesn't allocate on every render.
const noLocationFiltersWithContent: Map<string, LinkedArchiveTreeNode> = new Map();

const chunk = <T extends unknown>(sections: T[]) => {
  const cutoff = Math.max(20, Math.ceil(sections.length / 2));
  return [sections.slice(0, cutoff), sections.slice(cutoff)].filter((arr) => arr.length > 0);
};

interface ChapterFilterCommonProps {
  ariaLabelItemId?: string;
  className?: string;
  disabled?: boolean;
  selectedLocationFilters: Set<string>;
  setFilters: (filters: FiltersChange<LinkedArchiveTreeNode>) => void;
  id: string;
}

// locationFiltersWithContent decides two things: what All/None dispatches, and
// whether a childless filter is disabled. Callers that can hit either need it.
interface ChapterFilterWithContentProps extends ChapterFilterCommonProps {
  locationFilters: LocationFilters;
  locationFiltersWithContent: Map<string, LinkedArchiveTreeNode>;
  multiselect: boolean;
}

// practice questions hits neither: every one of its filters has children, and
// single-select renders no All/None. Omitting the map is only allowed for that
// exact shape so it can't silently disable filters somewhere else.
interface ChapterFilterWithoutContentProps extends ChapterFilterCommonProps {
  locationFilters: LocationFiltersWithChildren;
  locationFiltersWithContent?: undefined;
  multiselect: false;
}

type ChapterFilterProps = ChapterFilterWithContentProps | ChapterFilterWithoutContentProps;

const ChapterFilter = (props: ChapterFilterProps) => {
  const [openChapterId, setOpenChapterId] = React.useState<string | null>(null);
  const intl = useIntl();
  const locationFiltersWithContent = props.locationFiltersWithContent ?? noLocationFiltersWithContent;
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

  return <div className={classNames('chapter-filter', props.className)} tabIndex={-1} id={props.id} ref={ref}>
    {props.multiselect
      ? (
        <AllOrNone
          onNone={() => setSelectedChapters({ remove: Array.from(locationFiltersWithContent.values()), new: [] })}
          onAll={() => setSelectedChapters({ remove: [], new: Array.from(locationFiltersWithContent.values()) })}
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
                disabled={props.disabled || !locationFiltersWithContent.has(section.id)}
                multiselect={Boolean(props.multiselect)}
                title={section.title}
                onChange={() => handleChange(section)}
                ariaLabel={getAriaLabel(section)}
                dataAnalyticsLabel={`Filter PQ by ${splitTitleParts(section.title).join(' ')}`}
              /></li>;
            } else {
              const chapterFilterItemId = `${props.id}-content-${section.id}`;
              return <li key={section.id}><StyledDetailsContainer>
                <StyledSummaryButton
                  aria-expanded={openChapterId === section.id}
                  aria-controls={chapterFilterItemId}
                  onClick={(ev: React.MouseEvent) => {
                    ev.preventDefault();
                    setOpenChapterId((currentId) => currentId !== section.id ? section.id : null);
                  }}
                >
                  <ChapterTitle dangerouslySetInnerHTML={{ __html: section.title }} />
                  <AngleIcon direction={openChapterId === section.id ? 'up' : 'down'} />
                </StyledSummaryButton>
                <StyledChapterFilterItemWrapper
                  id={chapterFilterItemId}
                  hidden={openChapterId !== section.id}
                  aria-hidden={openChapterId !== section.id}
                >
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
              </StyledDetailsContainer></li>;
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

export const StyledDetailsContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('chapter-filter-details', className)} {...props} />
);

export const StyledSummaryButton = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <PlainButton className={classNames('chapter-filter-summary-button', className)} {...props} />
);

export const StyledSectionItem = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <PlainButton className={classNames('chapter-filter-section-item', className)} {...props} />
);

export const StyledChapterFilterItemWrapper = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('chapter-filter-item-wrapper', className)} {...props} />
);

export default ChapterFilter;
