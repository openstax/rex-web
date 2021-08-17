import Cookies from 'js-cookie';
import { disableAnalyticsCookie } from './constants';

export const trackingIsDisabled = () => !!Cookies.get(disableAnalyticsCookie);
