import React from 'react';
import { FormattedMessage } from 'react-intl';
import decreaseTextSizeIcon from '../../../../assets/text-size-decrease.svg';
import increaseTextSizeIcon from '../../../../assets/text-size-increase.svg';
import textSizeIcon from '../../../../assets/text-size.svg';
import { HTMLInputElement } from '@openstax/types/lib.dom';
import {
  textResizerDefaultValue,
  textResizerMaxValue,
  textResizerMinValue,
  TextResizerValue,
  textResizerValues
} from '../../constants';
import * as Styled from './styled';

export interface TextResizerProps {
  bookTheme: string;
  textSize: TextResizerValue | null;
  setTextSize: (value: TextResizerValue) => void;
  mobileToolbarOpen?: boolean;
  mobileVariant?: boolean;
}

// tslint:disable-next-line:variable-name
export const TextResizer = (props: TextResizerProps) => {
  const onChangeTextSize = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = parseInt(target.value, 10) as TextResizerValue;
    if (!textResizerValues.includes(value)) { return; }
    props.setTextSize(value);
  };

  const onDecreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = ((props.textSize || textResizerDefaultValue) - 1);
    if (newValue < textResizerMinValue) { return; }
    props.setTextSize(newValue as TextResizerValue);
  };

  const onIncreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = ((props.textSize || textResizerDefaultValue) + 1);
    if (newValue > textResizerMaxValue) { return; }
    props.setTextSize(newValue as TextResizerValue);
  };

  if (props.textSize === null) { return null; }

  return (
    <Styled.TextResizerDropdown
      transparentTab={false}
      showLabel={false}
      showAngleIcon={false}
      toggleChildren={<img aria-hidden='true' alt='' src={textSizeIcon} />}
      label='i18n:toolbar:textresizer:button:aria-label'
      ariaLabelId='i18n:toolbar:textresizer:button:aria-label'
      dataAnalyticsLabel='Change text size'
      {...props}
    >
      <Styled.TextResizerMenu tabIndex={-1} bookTheme={props.bookTheme} textSize={props.textSize}>
        <label id='text-resizer-label'><FormattedMessage id='i18n:toolbar:textresizer:popup:heading' /></label>
        <div className='controls'>
          <Styled.TextResizerChangeButton
            onClick={onDecreaseTextSize}
            ariaLabelId='i18n:toolbar:textresizer:button:decrease:aria-label'
            data-testid='decrease-text-size'
          >
            <img aria-hidden='true' src={decreaseTextSizeIcon} alt='' />
          </Styled.TextResizerChangeButton>
          <input
            type='range'
            step='1'
            min={textResizerMinValue}
            max={textResizerMaxValue}
            onChange={onChangeTextSize}
            value={props.textSize}
            data-testid='change-text-size'
            aria-labelledby='text-resizer-label'
          />
          <Styled.TextResizerChangeButton
            onClick={onIncreaseTextSize}
            ariaLabelId='i18n:toolbar:textresizer:button:increase:aria-label'
            data-testid='increase-text-size'
          >
            <img aria-hidden='true' src={increaseTextSizeIcon} alt='' />
          </Styled.TextResizerChangeButton>
        </div>
      </Styled.TextResizerMenu>
    </Styled.TextResizerDropdown>
  );
};
