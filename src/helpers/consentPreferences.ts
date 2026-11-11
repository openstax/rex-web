import type { ConsentPreferences } from 'cookieyes';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isPlainObject = (value: unknown): value is {[key: string]: unknown} =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Consent preferences from a launch token or a consent endpoint. Either list may be missing, but with neither
// there is no recorded decision, so the user should still be asked.
export const parseConsentPreferences = (value: unknown): ConsentPreferences | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const accepted = isStringArray(value.accepted) ? value.accepted : undefined;
  const rejected = isStringArray(value.rejected) ? value.rejected : undefined;

  if (!accepted && !rejected) {
    return undefined;
  }

  return {accepted: accepted ?? [], rejected: rejected ?? []};
};
