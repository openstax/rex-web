import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { assertWindow } from '../../../utils';
import * as Styled from './styled';

interface Props {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const PrintButton = (props: Props) => {
  const intl = useIntl();

  return <FormattedMessage id='i18n:toolbar:print:text'>
    {(msg: string) => (
      <Styled.PrintOptWrapper
        onClick={props.onClick ? props.onClick : () => assertWindow().print()}
        aria-label={intl.formatMessage({id: 'i18n:toolbar:print:aria-label'})}
        data-testid='print'
        data-analytics-label='print'
        className={props.className}
        disabled={props.disabled}
      >
        <Styled.PrintIcon />
        <Styled.PrintOptions>{msg}</Styled.PrintOptions>
      </Styled.PrintOptWrapper>
    )}
  </FormattedMessage>;
};

export default PrintButton;
