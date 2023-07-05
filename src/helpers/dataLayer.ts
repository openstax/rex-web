import * as selectHead from '../app/head/selectors';
import { Store } from '../app/types';
import { assertWindow } from '../app/utils/browser-assertions';
import { AccountsUser } from '../gateways/createUserLoader';

let appIsInitialized = false;

export const setUserTags = (user: AccountsUser | {[key: string]: undefined} = {}) => {
  const role = (['instructor', 'student'] as Array<string | undefined>).includes(user.self_reported_role)
    ? user.self_reported_role
    : user.uuid
      ? 'other'
      : 'none';

  const roleTag = `role=${role}`;

  const faculty = user.faculty_status;
  const facultyTag = faculty ? `faculty=${faculty}` : undefined;

  const usingOpenstax = user.using_openstax;
  const usingOpenstaxTag = usingOpenstax ? 'adopter=yes' : undefined;

  const userTags = ['', roleTag, facultyTag, usingOpenstaxTag, '']
    .filter((x) => x !== undefined).join(',');

  // if app is pending initialization, just stage the dataLayer, if its already
  // initialized we need to trigger a re-configure
  assertWindow().dataLayer.push(appIsInitialized
    ? {event: 'app_config', user_tags: userTags}
    : {user_tags: userTags}
  );
};

export const getContentTags = (tags: string[]) => {
  return tags.length > 0
    ? {content_tags: ['', ...tags, ''].join(',')}
    : {};
};

export const setContentTags = (tags: string[]) => {
  const {content_tags} = getContentTags(tags);

  if (typeof window !== 'undefined' && content_tags) {
    // if app is pending initialization, just stage the dataLayer, if its already
    // initialized we need to trigger a re-configure
    window.dataLayer.push(appIsInitialized
      ? {event: 'app_config', content_tags}
      : {content_tags}
    );
  }
};

export const appInitialized = (app: {store: Store}) => {
  // on a pre-rendered load, setHead will not have been called on the browser side,
  // so we include contentTags explicitly here.
  const contentTags = getContentTags(selectHead.contentTags(app.store.getState()));
  assertWindow().dataLayer.push({event: 'app_loaded', ...contentTags});
  appIsInitialized = true;
};
