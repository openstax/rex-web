export const clearErrorAfter = 500000;
export const shouldAutoDismissAfter = 300000;
export const fadeOutDuration = 1000;
export const timeUntilFadeIn = 5;

export const toastMessageKeys = {
  higlights: {
    failure: {
      create: 'i18n:notification:toast:highlights:create-failure',
      delete: 'i18n:notification:toast:highlights:delete-failure',
      load: 'i18n:notification:toast:highlights:load-failure',
      update: {
        annotation: 'i18n:notification:toast:highlights:update-failure:annotation',
        color: 'i18n:notification:toast:highlights:update-failure:color',
      },
    },
    popUp: {
      failure: {
        load: 'i18n:notification:toast:highlights:popup:load-failure',
        print: 'i18n:notification:toast:highlights:popup:print-failure',
      },
    },
  },
  studyGuides: {
    failure: {
      load: 'i18n:notification:toast:study-guides:load-failure',
    },
    popUp: {
      failure: {
        load: 'i18n:notification:toast:study-guides:popup:load-failure',
        print: 'i18n:notification:toast:study-guides:popup:print-failure',
      }
    }
  },
};
