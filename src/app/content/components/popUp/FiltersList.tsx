import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PlainButton } from '../../../components/Button';
import Times from '../../../components/Times';
import { SummaryFiltersUpdate } from '../../highlights/types';
import { LinkedArchiveTreeNode } from '../../types';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { LocationFilters } from './types';
import classNames from 'classnames';
import './FiltersList.css';

// Plain button component for filter list close button
const StyledPlainButton = ({ className, ...props }: React.ComponentProps<typeof PlainButton>) => (
  <PlainButton
    data-testid='filters-list-close-button'
    {...props}
    className={classNames('filters-list-close-button', className)}
  />
);
export { StyledPlainButton };

const ItemLabel = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className="filters-list-item-label">
    {children}
  </span>
);

const FilterListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="filters-list-item">{children}</li>
);

interface FiltersListColorProps {
  color: HighlightColorEnum;
  ariaLabelKey: (color: HighlightColorEnum) => string;
  dataAnalyticsLabel: (color: HighlightColorEnum) => string;
  labelKey: (color: HighlightColorEnum) => string;
  onRemove: () => void;
}

export const FiltersListColor = (props: FiltersListColorProps) => (
  <FilterListItem>
    <StyledPlainButton
      aria-label={useIntl().formatMessage({id: props.ariaLabelKey(props.color)}, {filterValue: props.color})}
      onClick={props.onRemove}
      data-analytics-label={props.dataAnalyticsLabel(props.color)}
    >
      <Times />
    </StyledPlainButton>

    <ItemLabel>
      <FormattedMessage id={props.labelKey(props.color)}>
        {(msg) => msg}
      </FormattedMessage>
    </ItemLabel>
  </FilterListItem>
);

interface FiltersListChapterProps {
  title: string;
  ariaLabelKey: (title: string) => string;
  dataAnalyticsLabel: (splitTitle: string) => string;
  locationId: string;
  onRemove: () => void;
}

export const FiltersListChapter = (props: FiltersListChapterProps) => (
  <FilterListItem>
    <StyledPlainButton
      aria-label={useIntl().formatMessage(
        { id: props.ariaLabelKey(props.title) },
        { filterValue: splitTitleParts(props.title).join(' ') }
      )}
      data-analytics-label={props.dataAnalyticsLabel(splitTitleParts(props.title).join(' '))}
      onClick={props.onRemove}
    >
      <Times />
    </StyledPlainButton>
    <ItemLabel dangerouslySetInnerHTML={{ __html: props.title }} />
  </FilterListItem>
);

interface FiltersListProps {
  className?: string;
  locationFilters: LocationFilters;
  selectedLocationFilters: Set<string>;
  selectedColorFilters: Set<HighlightColorEnum>;
  setFilters: (change: SummaryFiltersUpdate) => void;
  chapterAriaLabelKey: (title: string) => string;
  chapterDataAnalyticsLabel: (splitTitle: string) => string;
  colorAriaLabelKey: (color: HighlightColorEnum) => string;
  colorDataAnalyticsLabel: (color: HighlightColorEnum) => string;
  colorLabelKey: (color: HighlightColorEnum) => string;
}

function filterMessage(type: string, prevRef: React.MutableRefObject<number>, current: number) {
  const prev = prevRef.current;
  if (current === prev) {
    return '';
  }
  prevRef.current = current;
  return `${current > prev ? 'added' : 'removed'} ${type} filter (${current} selected)`;
}

function useFilterCounts(
  colorFilterCount: number,
  locationFilterCount: number
) {
  const prevColorCount = React.useRef(colorFilterCount);
  const prevLocationCount = React.useRef(locationFilterCount);

  return React.useMemo(() => {
    const messages = [
      filterMessage('color', prevColorCount, colorFilterCount),
      filterMessage('chapter', prevLocationCount, locationFilterCount),
    ].filter((m) => m !== '');

    if (messages.length > 0) {
      return `Guide updated with ${messages.join(', ')}`;
    }
  }, [colorFilterCount, locationFilterCount]);
}

const StatusDiv = ({ children }: { children: React.ReactNode }) => (
  <div className="filters-list-status" role="status">{children}</div>
);

// Plain React component for FiltersList
export default function FiltersList({
  className,
  locationFilters,
  selectedColorFilters,
  selectedLocationFilters,
  setFilters,
  chapterAriaLabelKey,
  chapterDataAnalyticsLabel,
  colorAriaLabelKey,
  colorDataAnalyticsLabel,
  colorLabelKey,
}: FiltersListProps) {
  const intl = useIntl();

  const onRemoveChapter = (location: LinkedArchiveTreeNode) => {
    setFilters({
      locations: { remove: [location], new: [] },
    });
  };

  const onRemoveColor = (color: HighlightColorEnum) => {
    setFilters({
      colors: { remove: [color], new: [] },
    });
  };

  const statusMessage = useFilterCounts(selectedColorFilters.size, selectedLocationFilters.size);

  return <>
    <StatusDiv>{statusMessage}</StatusDiv>
    <ul
      className={classNames('filters-list', className)}
      aria-live='polite'
      aria-atomic='true'
      aria-label={intl.formatMessage({id: 'i18n:highlighting:filters:applied-filters:aria-label'})}
      data-testid="filters-list"
    >
      {Array.from(locationFilters).map(([locationId, location]) => selectedLocationFilters.has(locationId) &&
      <FiltersListChapter
        key={locationId}
        title={location.section.title}
        locationId={locationId}
        onRemove={() => onRemoveChapter(location.section)}
        ariaLabelKey={chapterAriaLabelKey}
        dataAnalyticsLabel={chapterDataAnalyticsLabel}
      />)}
      {selectedColorFilters && [...selectedColorFilters].sort().map((color) => <FiltersListColor
        key={color}
        color={color}
        onRemove={() => onRemoveColor(color)}
        ariaLabelKey={colorAriaLabelKey}
        dataAnalyticsLabel={colorDataAnalyticsLabel}
        labelKey={colorLabelKey}
      />)}
    </ul>
  </>;
}
