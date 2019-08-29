import * as Cookies from 'js-cookie';
import { Message } from './types'
import {
  differenceInDays,
  endOfToday,
} from 'date-fns';

const messageDismissedPrefix: string = 'message_dismissed';

const dismissedPhrase: string = 'true';

export const dismissAppMessage = (message: Message) => {
  const daysToExpire = (
    message.end_at && (
      differenceInDays(
        new Date(message.end_at),
        endOfToday()
      ) + 7
    )
  ) || (
    365 * 20
  );

  Cookies.set(`${messageDismissedPrefix}_${message.id}`, dismissedPhrase, { expires: daysToExpire });
};

export const isAppMessageDismissed = (message: Message) => {
  return Cookies.get(`${messageDismissedPrefix}_${message.id}`) === dismissedPhrase;
};
