import React from 'react';
import { useIntl } from 'react-intl';
import { TextResizer as TextResizerControl, TextResizerValue } from '@openstax/ui-components';
import textSizeIcon from '../../../../assets/text-size.svg';
import theme from '../../../theme';
import { BookWithOSWebData } from '../../types';
import * as Styled from './styled';

export interface TextResizerProps {
  bookTheme: BookWithOSWebData['theme'];
  textSize: TextResizerValue | null;
  setTextSize: (value: TextResizerValue) => void;
  mobileToolbarOpen?: boolean;
  mobileVariant?: boolean;
}

export const TextResizer = (props: TextResizerProps) => {
  const intl = useIntl();

  if (props.textSize === null) { return null; }

  const message = (id: string) => intl.formatMessage({ id });

  return (
    <Styled.TextResizerDropdown
      transparentTab={false}
      showLabel={false}
      showAngleIcon={false}
      toggleChildren={<img aria-hidden='true' alt='' src={textSizeIcon} />}
      label='i18n:toolbar:textresizer:button:aria-label'
      ariaLabelId='i18n:toolbar:textresizer:button:aria-label'
      dataAnalyticsLabel='Change text size'
      controlsId='text-resizer-menu'
      menuClassName='text-resizer-menu'
      {...props}
    >
      <Styled.TextResizerMenu id='text-resizer-menu'>
        <div id='text-resizer-label' className='text-resizer-heading'>
          {message('i18n:toolbar:textresizer:popup:heading')}
        </div>
        <TextResizerControl
          value={props.textSize}
          onChange={props.setTextSize}
          aria-labelledby='text-resizer-label'
          sliderLabel={message('i18n:toolbar:textresizer:popup:heading')}
          decreaseLabel={message('i18n:toolbar:textresizer:button:decrease:aria-label')}
          increaseLabel={message('i18n:toolbar:textresizer:button:increase:aria-label')}
          announcement={(percent) => intl.formatMessage({ id: 'i18n:toolbar:textresizer:announcement' }, { percent })}
          fillColor={props.bookTheme ? theme.color.primary[props.bookTheme].base : undefined}
        />
      </Styled.TextResizerMenu>
    </Styled.TextResizerDropdown>
  );
};
