import * as Cookies from 'js-cookie';
import { Message } from './types'

const messageDismissedPrefix: string = 'message_dismissed';

const dismissedPhrase: string = 'true';

export const dismissAppMessage = (message: Message) => {
  const expires = 365 * 20;
  Cookies.set(`${messageDismissedPrefix}_${message.id}`, dismissedPhrase, { expires });
};

export const isAppMessageDismissed = (message: Message) => {
  return Cookies.get(`${messageDismissedPrefix}_${message.id}`) === dismissedPhrase;
};
