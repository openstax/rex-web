import React from 'react';
import { FormattedMessage } from 'react-intl';
import decreaseTextSizeIcon from '../../../../assets/text-size-decrease.svg';
import increaseTextSizeIcon from '../../../../assets/text-size-increase.svg';
import textSizeIcon from '../../../../assets/text-size.svg';
import { textResizerMaxValue, textResizerMinValue } from '../constants';
import * as Styled from './styled';

interface Props {
  bookTheme: string;
  onChangeTextSize: (e: React.FormEvent<HTMLInputElement>) => void;
  onDecreaseTextSize: (e: React.FormEvent<HTMLInputElement>) => void;
  onIncreaseTextSize: (e: React.FormEvent<HTMLInputElement>) => void;
  onToggle?: () => void;
  textSize: number;
  mobileToolbarOpen?: boolean;
}

// tslint:disable-next-line:variable-name
export const TextResizer = (props: Props) => {
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
      <Styled.TextResizerMenu tabIndex={0} bookTheme={props.bookTheme} textSize={props.textSize}>
        <FormattedMessage id='i18n:toolbar:textresizer:popup:heading' />
        <div className='controls'>
          <Styled.TextResizerChangeButton
            onClick={props.onDecreaseTextSize}
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
            onChange={props.onChangeTextSize}
            value={props.textSize}
            data-testid='change-text-size'
          />
          <Styled.TextResizerChangeButton
            onClick={props.onIncreaseTextSize}
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
