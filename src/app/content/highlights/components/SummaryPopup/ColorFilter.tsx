import { HighlightColorEnum } from '@openstax/highlighter/highlights-client/dist/models/Highlight';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { filtersChange, setColorsFilter } from '../../actions';
import { highlightStyles } from '../../constants';
import { colorsFilter } from '../../selectors';
import ColorIndicator from '../ColorIndicator';

interface Props {
  className?: string;
}

const allColors = highlightStyles.map((style) => style.label);

// tslint:disable-next-line:variable-name
const ColorFilter = ({className}: Props) => {
  const selectedColors = useSelector(colorsFilter);
  const dispatch = useDispatch();

  const setSelectedColors = (colors: HighlightColorEnum[]) => {
    dispatch(setColorsFilter(colors));
    dispatch(filtersChange());
  };

  const handleChange = (label: HighlightColorEnum) => {
    if (selectedColors.includes(label)) {
      setSelectedColors(selectedColors.filter(not(match(label))));
    } else {
      setSelectedColors([...selectedColors, label]);
    }
  };

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedColors([])}
      onAll={() => setSelectedColors(allColors)}
    />
    {highlightStyles.map((style) => <Checkbox
      key={style.label}
      checked={selectedColors.includes(style.label)}
      onChange={() => handleChange(style.label)}
    >
      <ColorIndicator style={style} size='small'/>
      <FormattedMessage id={`i18n:highlighting:colors:${style.label}`}>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </Checkbox>)}
  </div>;
};

export default styled(ColorFilter)`
  background: ${theme.color.white};
  display: flex;
  flex-direction: column;
  ${textStyle}
  font-size: 1.4rem;
  padding: 0.8rem 1.6rem;
  outline: none;
  z-index: 2;

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
