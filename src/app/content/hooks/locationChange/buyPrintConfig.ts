import { AppServices, MiddlewareAPI } from '../../../types';
import { receiveBuyPrintConfig } from '../../actions';
import * as selectContent from '../../selectors';

const loadBuyPrintConfig = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, buyPrintConfigLoader} = services;

  const state = getState();
  const book = selectContent.book(state);

  if (!book || !('slug' in book) || !book.slug) {
    return;
  }

  const response = await buyPrintConfigLoader.load(book)
    .catch(() => null);

  const config = response ? response.buy_urls[0] : null;

  if (!config) {
    return;
  }

  dispatch(receiveBuyPrintConfig(config));
};

export default loadBuyPrintConfig;
