import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import Times from '../../../components/Times';
import { textStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { disablePrint } from '../../components/utils/disablePrint';
import { SummaryFiltersUpdate } from '../../highlights/types';
import { LinkedArchiveTreeNode } from '../../types';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { LocationFilters } from './types';

// tslint:disable-next-line: variable-name
export const StyledPlainButton = styled(PlainButton)`
  height: 1.7rem;
  margin-right: 0.4rem;

  svg {
    height: 0.8rem;
    width: 0.8rem;
    color: ${theme.color.primary.gray.base};
  }

  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
const ItemLabel = styled.span`
  ${textStyle}
  font-weight: 300;
  color: ${theme.color.primary.gray.base};
  max-width: 8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  line-height: 1.5rem;

  @media print {
    max-width: max-content;
  }
`;

// tslint:disable-next-line: variable-name
const FilterListItem = styled.li`
  margin-right: 3.2rem;
  display: flex;
  align-items: center;
  overflow: visible;
  height: 4rem;
`;

interface FiltersListColorProps {
  color: HighlightColorEnum;
  ariaLabelKey: (color: HighlightColorEnum) => string;
  labelKey: (color: HighlightColorEnum) => string;
  onRemove: () => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListColor = (props: FiltersListColorProps) => (
  <FilterListItem>
    <StyledPlainButton
      aria-label={useIntl().formatMessage({id: props.ariaLabelKey(props.color)}, {filterValue: props.color})}
      onClick={props.onRemove}
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
  locationId: string;
  onRemove: () => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListChapter = (props: FiltersListChapterProps) => (
  <FilterListItem>
    <StyledPlainButton
      aria-label={useIntl().formatMessage({
        id: 'i18n:highlighting:filters:remove:chapter'},
        {filterValue: splitTitleParts(props.title).join(' ')}
      )}
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
  colorAriaLabelKey: (color: HighlightColorEnum) => string;
  colorLabelKey: (color: HighlightColorEnum) => string;
}

// tslint:disable-next-line: variable-name
const FiltersList = ({
  className,
  locationFilters,
  selectedColorFilters,
  selectedLocationFilters,
  setFilters,
  colorAriaLabelKey,
  colorLabelKey,
}: FiltersListProps) => {

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

  return <ul className={className}>
    {Array.from(locationFilters).map(([locationId, location]) => selectedLocationFilters.has(locationId) &&
    <FiltersListChapter
      key={locationId}
      title={location.section.title}
      locationId={locationId}
      onRemove={() => onRemoveChapter(location.section)}
    />)}
    {selectedColorFilters && [...selectedColorFilters].sort().map((color) => <FiltersListColor
      key={color}
      color={color}
      onRemove={() => onRemoveColor(color)}
      ariaLabelKey={colorAriaLabelKey}
      labelKey={colorLabelKey}
    />)}
  </ul>;
};

export default styled(FiltersList)`
  ${textStyle}
  font-size: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0;
  padding: 0 2.8rem 1rem 2.8rem;
  margin-top: -1rem;
  list-style: none;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    padding: 0 2.4rem 0.4rem 2.4rem;
  `)}

  @media print {
    margin: 0;
  }
`;
