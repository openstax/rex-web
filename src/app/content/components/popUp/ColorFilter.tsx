import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import AllOrNone from '../../../components/AllOrNone';
import Checkbox from '../../../components/Checkbox';
import { useTrapTabNavigation } from '../../../reactUtils/focusUtils';
import { highlightStyles } from '../../constants';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { FiltersChange } from './types';
import { Fieldset } from './Filters';
import './ColorFilter.css';

const ColorLabel = ({ children }: { children: React.ReactNode }) => (
  <span className='color-filter-label'>{children}</span>
);
export interface ColorFilterProps {
  className?: string;
  disabled?: boolean;
  styles: typeof highlightStyles;
  selectedColorFilters: Set<HighlightColorEnum>;
  colorFiltersWithContent: Set<HighlightColorEnum>;
  updateSummaryFilters: (change: FiltersChange<HighlightColorEnum>) => void;
  labelKey: (label: HighlightColorEnum) => string;
  id: string;
}

const ColorFilter = ({
  className,
  disabled,
  styles,
  selectedColorFilters,
  colorFiltersWithContent,
  updateSummaryFilters,
  labelKey,
  id,
}: ColorFilterProps) => {
  const ref = React.useRef<HTMLElement>(null);
  useTrapTabNavigation(ref);

  const setSelectedColors = (change: FiltersChange<HighlightColorEnum>) => {
    updateSummaryFilters(change);
  };

  const handleChange = (label: HighlightColorEnum) => {
    if (selectedColorFilters.has(label)) {
      setSelectedColors({ remove: [label], new: [] });
    } else {
      setSelectedColors({ remove: [], new: [label] });
    }
  };

  return <div className={classNames('color-filter', className)} tabIndex={-1} id={id} ref={ref}>
    <AllOrNone
      onNone={() => setSelectedColors({ remove: Array.from(colorFiltersWithContent), new: [] })}
      onAll={() => setSelectedColors({ remove: [], new: Array.from(colorFiltersWithContent) })}
      disabled={disabled}
    />
    <Fieldset>
      <legend>Filter by colors</legend>
      {styles.map((style) => <Checkbox
        key={style.label}
        checked={selectedColorFilters.has(style.label)}
        disabled={disabled || !colorFiltersWithContent.has(style.label)}
        onChange={() => handleChange(style.label)}
      >
        <ColorIndicator style={style} size='small'/>
        <ColorLabel>
          <FormattedMessage id={labelKey(style.label)}>
            {(msg) => msg}
          </FormattedMessage>
        </ColorLabel>
      </Checkbox>)}
    </Fieldset>
  </div>;
};

export default ColorFilter;
