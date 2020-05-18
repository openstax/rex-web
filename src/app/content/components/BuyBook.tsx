import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { buyBookLink } from '../selectors';
import * as Styled from './Toolbar/styled';

// tslint:disable-next-line: variable-name
const BuyBook = () => {
  const link = useSelector(buyBookLink);

  if (!link) { return null; }

  return <FormattedMessage id='i18n:toolbar:buy-book:aria-label:text'>
    {(ariaLabel) => <Styled.BuyBookWrapper
        aria-label={ariaLabel}
        target='_blank'
        rel='noopener'
        href={link}
        data-analytics-label='buy-book'
      >
        <FormattedMessage id='i18n:toolbar:buy-book:text'>
          {(msg) => <Styled.PrintOptions>{msg}</Styled.PrintOptions>}
        </FormattedMessage>
    </Styled.BuyBookWrapper>}
  </FormattedMessage>;
};

export default BuyBook;
