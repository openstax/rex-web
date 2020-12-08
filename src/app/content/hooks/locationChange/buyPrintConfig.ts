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

  const config = (await buyPrintConfigLoader.load(book)).buy_urls[0];

  if (!config) {
    return;
  }

  dispatch(receiveBuyPrintConfig(config));
};

export default loadBuyPrintConfig;
