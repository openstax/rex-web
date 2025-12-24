import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import { textRegularSize } from '../../components/Typography';
import theme from '../../theme';
import { contentTextWidth } from './constants';
import { disablePrint } from './utils/disablePrint';
import { Book, BookWithOSWebData } from '../types';

const BuyBookAlignment = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: ${contentTextWidth}rem;
  overflow: visible;
  ${disablePrint}
`;

const BuyBookLink = styled.a`
  ${textRegularSize};
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  height: 5rem;
  width: 19rem;
  color: ${theme.color.primary.orange.base};
  border: solid 0.1rem;
  font-weight: 700;
`;

const BuyBook = ({book}: {book: Book}) => {
  const bookWithOSwebData = book as BookWithOSWebData;

  if (!bookWithOSwebData.amazon_link) {
    return null;
  }
  return <BuyBookAlignment>
    <BuyBookLink
      target='_blank'
      rel='noopener'
      href={bookWithOSwebData.amazon_link}
      data-analytics-label='buy-book'
    >
      <FormattedMessage id='i18n:toolbar:buy-book:text'>
        {(msg) => msg}
      </FormattedMessage>
    </BuyBookLink>
  </BuyBookAlignment>;
};

export default BuyBook;
