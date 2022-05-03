export const arrowDesktopHeight = 11.5;
export const arrowDesktopWidth = 15;
export const arrowMobileHeight = 6.2;
export const arrowMobileWidth = 5.2;
export const arrowRightMargin = 1;
export const arrowTopMargin = 1.6;

export const closeButtonSize = 4;
export const closeButtonDistanceFromContent = 1.6;
export const closeButtonMobileMargin = 3;

export const contentMarginTop = 1.6;
export const contentMarginLeft = 1;
export const contentWidth = 69;

export const mobileSpotlightPadding = .6;

export const cookieNudge = {
  // How many times nuge was shown
  counter: 'nudge_study_guides_counter',
  // When nudge was shown
  date: 'nudge_study_guides_date',
  // How many pages user has opened (opening the same page twice counts it as 2)
  pageCounter: 'nudge_study_guides_page_counter',
};

// Show nudge only for users which opened at least 2 pages
export const nudgeStudyToolsMinPageLimit = 2;

export const daysUntilCookieExpires = 365 * 20;

// Show nudge every 4 weeks: 4 * 7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms
export const timeIntervalBetweenShowingNudgeInMs = 4 * 7 * 24 * 60 * 60 * 1000;
// Show nudge max 3 times
export const nudgeStudyToolsShowLimit = 3;
// Id of the element which should be highlighted
export const nudgeStudyToolsTargetId = 'nudge-study-tools';
export const mobileNudgeStudyToolsTargetId = 'mobile-menu-button';
