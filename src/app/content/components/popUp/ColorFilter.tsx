import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import AllOrNone from '../../../components/AllOrNone';
import Checkbox from '../../../components/Checkbox';
import { textStyle } from '../../../components/Typography/base';
import { match, not } from '../../../fpUtils';
import theme from '../../../theme';
import { highlightStyles } from '../../constants';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { SummaryFilters } from '../../highlights/types';
import { filters } from '../../styles/PopupConstants';

// tslint:disable-next-line: variable-name
const ColorLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export interface ColorFilterProps {
  className?: string;
  disabled?: boolean;
  styles: typeof highlightStyles;
  selectedColorFilters: Set<HighlightColorEnum>;
  colorFiltersWithContent: Set<HighlightColorEnum>;
  setSummaryFilters: (filters: Pick<SummaryFilters, 'colors'>) => void;
  labelKey: (label: HighlightColorEnum) => string;
}

// tslint:disable-next-line:variable-name
const ColorFilter = ({
  className,
  disabled,
  styles,
  selectedColorFilters,
  colorFiltersWithContent,
  setSummaryFilters,
  labelKey,
}: ColorFilterProps) => {

  const setSelectedColors = (colors: HighlightColorEnum[]) => {
    setSummaryFilters({colors});
  };

  const handleChange = (label: HighlightColorEnum) => {
    if (selectedColorFilters.has(label)) {
      setSelectedColors([...selectedColorFilters].filter(not(match(label))));
    } else {
      setSelectedColors([...selectedColorFilters, label]);
    }
  };

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedColors([])}
      onAll={() => setSelectedColors(Array.from(colorFiltersWithContent))}
      disabled={disabled}
    />
    {styles.map((style) => <Checkbox
      key={style.label}
      checked={selectedColorFilters.has(style.label)}
      disabled={disabled || !colorFiltersWithContent.has(style.label)}
      onChange={() => handleChange(style.label)}
    >
      <ColorIndicator style={style} size='small'/>
      <ColorLabel>
        <FormattedMessage id={labelKey(style.label)}>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </ColorLabel>
    </Checkbox>)}
  </div>;
};

export default styled(ColorFilter)`
  background: ${theme.color.white};
  display: flex;
  flex-direction: column;
  ${textStyle}
  font-size: 1.4rem;
  padding: ${filters.dropdownContent.padding.topBottom}rem ${filters.dropdownContent.padding.sides}rem;
  outline: none;
  z-index: 1;

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
    text-transform: capitalize;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
