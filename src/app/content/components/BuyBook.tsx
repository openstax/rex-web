import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import theme from '../../theme';
import { contentTextWidth } from './constants';
import { disablePrintClass } from './utils/disablePrint';
import { setUtmCampaign } from '../utils/urlUtils';
import { Book, BookWithOSWebData } from '../types';
import './BuyBook.css';

const BuyBook = ({book}: {book: Book}) => {
  const bookWithOSwebData = book as BookWithOSWebData;

  if (!bookWithOSwebData.amazon_link) {
    return null;
  }
  return (
    <div
      className={classNames('buy-book-alignment', disablePrintClass)}
      style={{
        '--buy-book-max-width': `${contentTextWidth}rem`,
      } as React.CSSProperties}
    >
      <a
        className="buy-book-link"
        target='_blank'
        rel='noopener'
        href={setUtmCampaign(bookWithOSwebData.amazon_link, 'rex-page')}
        data-analytics-label='buy-book'
        style={{
          '--buy-book-color': theme.color.primary.orange.base,
        } as React.CSSProperties}
      >
        <FormattedMessage id='i18n:toolbar:buy-book:text'>
          {(msg) => msg}
        </FormattedMessage>
      </a>
    </div>
  );
};

export default BuyBook;
