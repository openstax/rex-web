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
import { filters, mobilePaddingSides } from '../../styles/PopupConstants';

// tslint:disable-next-line: variable-name
const ColorLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface Props {
  className?: string;
  styles: typeof highlightStyles;
  selectedColorFilters: Set<HighlightColorEnum>;
  colorFiltersWithContent: Set<HighlightColorEnum>;
  setSummaryFilters: (filters: Partial<SummaryFilters>) => void;
  labelKey: (label: HighlightColorEnum) => string;
}

// tslint:disable-next-line:variable-name
const ColorFilter = ({
  className,
  styles,
  selectedColorFilters,
  colorFiltersWithContent,
  setSummaryFilters,
  labelKey,
}: Props) => {

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
    />
    {styles.map((style) => <Checkbox
      key={style.label}
      checked={selectedColorFilters.has(style.label)}
      disabled={!colorFiltersWithContent.has(style.label)}
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
  /* 12rem is a width of Chapter button and then we add one side padding */
  max-width: calc(100vw - ${12 + mobilePaddingSides / 2}rem);

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
