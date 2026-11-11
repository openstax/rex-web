import type { ConsentPreferences } from 'cookieyes';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isPlainObject = (value: unknown): value is {[key: string]: unknown} =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Consent preferences from a launch token or a consent endpoint; both of their lists are optional
export const parseConsentPreferences = (value: unknown): ConsentPreferences | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  return {
    accepted: isStringArray(value.accepted) ? value.accepted : [],
    rejected: isStringArray(value.rejected) ? value.rejected : [],
  };
};
