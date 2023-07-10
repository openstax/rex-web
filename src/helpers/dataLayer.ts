/*
 * oxDLF is provided by https://github.com/openstax/analytics-helpers/blob/main/src/data-layer-factories.ts
 */
export const callDLF = (method: string, ...args: any[]) => {
  if (typeof window === 'undefined' || typeof (window as any).oxDLF === 'undefined') {
    return;
  }

  (window as any).oxDLF[method](...args);
};
