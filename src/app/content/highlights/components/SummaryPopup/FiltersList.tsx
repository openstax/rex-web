import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { PlainButton } from '../../../../components/Button';
import Times from '../../../../components/Times';
import { textStyle } from '../../../../components/Typography';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { setSummaryFilters } from '../../actions';
import { highlightLocations, summaryFilters } from '../../selectors';

// tslint:disable-next-line: variable-name
export const StyledPlainButton = styled(PlainButton)`
  padding: 0.5rem;

  svg {
    height: 1rem;
    width: 1rem;
  }
`;

// tslint:disable-next-line: variable-name
const ItemLabel = styled.span`
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`;

interface FiltersListColorProps {
  color: HighlightColorEnum;
  onRemove: (color: HighlightColorEnum) => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListColor = (props: FiltersListColorProps) => {
  const handleClick = () => {
    props.onRemove(props.color);
  };

  return <li>
    <StyledPlainButton onClick={handleClick}><Times /></StyledPlainButton>
    <ItemLabel>
      <FormattedMessage id={`i18n:highlighting:colors:${props.color}`}>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </ItemLabel>
  </li>;
};

interface FiltersListChapterProps {
  title: string;
  locationId: string;
  onRemove: (chapterId: string) => void;
}

// tslint:disable-next-line: variable-name
export const FiltersListChapter = (props: FiltersListChapterProps) => {
  const handleClick = () => {
    props.onRemove(props.locationId);
  };

  return <li>
    <StyledPlainButton onClick={handleClick}><Times /></StyledPlainButton>
    <ItemLabel dangerouslySetInnerHTML={{ __html: props.title }} />
  </li>;
};

interface FiltersListProps {
  className?: string;
}

// tslint:disable-next-line: variable-name
const FiltersList = ({className}: FiltersListProps) => {
  const locationFilters = useSelector(highlightLocations);
  const filters = useSelector(summaryFilters);

  const dispatch = useDispatch();

  const onRemoveChapter = (locationId: string) => {
    dispatch(setSummaryFilters({
      ...filters,
      locationIds: filters.locationIds.filter(not(match(locationId))),
    }));
  };

  const onRemoveColor = (color: HighlightColorEnum) => {
    dispatch(setSummaryFilters({
      ...filters,
      colors: filters.colors.filter(not(match(color))),
    }));
  };

  return <ul className={className}>
    {filters.locationIds.map((locationId) => locationFilters.has(locationId) && <FiltersListChapter
      key={locationId}
      title={locationFilters.get(locationId)!.title}
      locationId={locationId}
      onRemove={onRemoveChapter}
    />)}
    {filters.colors.map((color) => <FiltersListColor
      key={color}
      color={color}
      onRemove={onRemoveColor}
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
  padding: 2rem 0;
  list-style: none;

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}

  li {
    margin-right: 2rem;
    display: flex;
    align-items: center;
  }
`;
