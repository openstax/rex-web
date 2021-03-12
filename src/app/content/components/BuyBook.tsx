import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { buyPrintConfig } from '../selectors';
import { contentTextWidth } from './constants';
import { disablePrint } from './utils/disablePrint';

// tslint:disable-next-line:variable-name
const BuyBookAlignment = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: ${contentTextWidth}rem;
  overflow: visible;
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const BuyBookLink = styled.a`
  ${textRegularSize};
  font-size: 1.9rem;
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

// tslint:disable-next-line:variable-name
const BuyPrintDisclosure = styled.p`
  flex: 1;
  align-self: stretch;
  margin: 1.6rem 0 0 0;
  ${textRegularStyle}
  font-size: 1.2rem;
  line-height: 1.7rem;
`;

// tslint:disable-next-line: variable-name
const BuyBook = () => {
  const config = useSelector(buyPrintConfig);
  const formatMessage = useIntl().formatMessage;

  if (!config) { return null; }

  return <BuyBookAlignment>
    <BuyBookLink
      aria-label={formatMessage({id: 'i18n:toolbar:buy-book:aria-label:text'})}
      target='_blank'
      rel='noopener'
      href={config.url}
      data-analytics-label='buy-book'
    >
      <FormattedMessage id='i18n:toolbar:buy-book:text'>
        {(msg) => msg}
      </FormattedMessage>
    </BuyBookLink>
    {config.disclosure && <BuyPrintDisclosure>{config.disclosure}</BuyPrintDisclosure>}
  </BuyBookAlignment>;
};

export default BuyBook;
