import * as selectContent from '../../../app/content/selectors';
import { AnalyticsEvent } from '../event';

const eventName = 'REX highlighting - create note';

export const track = (
  book: ReturnType<typeof selectContent['bookAndPage']>['book'],
  color: string
): AnalyticsEvent | void => {
  const slug = book ? book.slug : 'unknown';

  console.log('this is color: ' + color);

  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: color,
      eventCategory: eventName,
      eventLabel: slug,
    }),
  };
};
