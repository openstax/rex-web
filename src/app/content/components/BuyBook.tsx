import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularSize } from '../../components/Typography';
import theme from '../../theme';
import { buyBookLink } from '../selectors';
import { contentTextWidth } from './constants';

// tslint:disable-next-line:variable-name
const BuyBookAlignment = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: ${contentTextWidth}rem;
`;

// tslint:disable-next-line:variable-name
const BuyBookWrapper = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  height: 5rem;
  width: 17.9rem;
  color: ${theme.color.primary.orange.base};
  border: solid 0.1rem;
  text-align: center;
`;

// tslint:disable-next-line:variable-name
const BuyBookText = styled.span`
  ${textRegularSize};
  margin: 0;
  font-weight: 600;
  line-height: 1.9rem;
`;

// tslint:disable-next-line: variable-name
const BuyBook = () => {
  const link = useSelector(buyBookLink);

  if (!link) { return null; }

  return <FormattedMessage id='i18n:toolbar:buy-book:aria-label:text'>
    {(ariaLabel) => <BuyBookAlignment >
      <BuyBookWrapper
        aria-label={ariaLabel}
        target='_blank'
        rel='noopener'
        href={link}
        data-analytics-label='buy-book'
      >
        <FormattedMessage id='i18n:toolbar:buy-book:text'>
          {(msg) => <BuyBookText>{msg}</BuyBookText>}
        </FormattedMessage>
      </BuyBookWrapper>
    </BuyBookAlignment>}
  </FormattedMessage>;
};

export default BuyBook;
