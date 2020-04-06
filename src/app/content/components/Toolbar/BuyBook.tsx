import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import BuyBookIcon from '../../../../assets/buy-book-icon.svg';
import { buyBookLink } from '../../selectors';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const BuyBook = () => {
  const link = useSelector(buyBookLink);

  if (!link) { return null; }

  return <FormattedMessage id='i18n:toolbar:buy-book:text'>
    {(msg) => <Styled.BuyBookWrapper
        aria-label={msg}
        target='_blank'
        rel='noopener'
        href={link}
        data-analytics-label='buy-book'
      >
        <Styled.BuyBookIcon aria-hidden src={BuyBookIcon}></Styled.BuyBookIcon>
        <Styled.PrintOptions>{msg}</Styled.PrintOptions>
    </Styled.BuyBookWrapper>}
  </FormattedMessage>;
};

export default BuyBook;
