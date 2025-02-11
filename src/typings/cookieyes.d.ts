declare module 'cookieyes' {
  export type ConsentPreferences = {
    accepted: string[],
    rejected: string[],
  };

  export type CookieYesBannerLoadEvent = {
    detail: { categories: Record<string, boolean>, isUserActionCompleted: boolean; },
  };

  export type CookieYesConsentUpdateEvent = {
    detail: ConsentPreferences;
  };
}
