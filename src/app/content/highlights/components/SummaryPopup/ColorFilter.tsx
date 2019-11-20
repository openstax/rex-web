import React from 'react';
import styled from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { match, not } from '../../../../fpUtils';
import { highlightStyles } from '../../constants';
import ColorIndicator from '../ColorIndicator';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const ColorFilter = ({className}: Props) => {
  const allColors = highlightStyles.map((style) => style.label);
  const [selectedColors, setSelectedColors] = React.useState<string[]>(allColors);

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedColors([])}
      onAll={() => setSelectedColors(allColors)}
    />
    {highlightStyles.map((style) => <Checkbox
      key={style.label}
      checked={selectedColors.includes(style.label)}
      onChange={() => selectedColors.includes(style.label)
        ? setSelectedColors(selectedColors.filter(not(match(style.label))))
        : setSelectedColors([...selectedColors, style.label])
      }
    >
      <ColorIndicator style={style} size='small'/>
      {style.label}
    </Checkbox>)}
  </div>;
};

export default styled(ColorFilter)`
  display: flex;
  flex-direction: column;
  ${textStyle}
  font-size: 1.4rem;
  padding: 0.8rem 1.6rem;
  outline: none;

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
