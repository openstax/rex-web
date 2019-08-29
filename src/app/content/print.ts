import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { assertWindow } from '../utils';

export const print = () => {
  const window: Window = assertWindow();
  window.print();

  const pathname: string = window.location.pathname;

  if (pathname) {
    let slug: string = 'unknown';
    const slugMatches: string[] | null = pathname.match(/\/books\/(.*)\/pages*/);
    if (slugMatches && slugMatches.length === 2) {
      slug = slugMatches[1];
    }
    googleAnalyticsClient.trackEvent('REX print', slug, pathname);
  } else {
    googleAnalyticsClient.trackEvent('REX print', 'unknown');
  }
};
