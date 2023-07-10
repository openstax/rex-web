import { fnIf } from '@openstax/ts-utils/misc/helpers';
import noop from 'lodash/noop';

/*
 * oxDLF is provided by https://github.com/openstax/analytics-helpers/blob/main/src/data-layer-factories.ts
 */
export const callDLF = (method: string, ...args: any[]) => {
  const win: any = fnIf(typeof window !== 'undefined', window, {});
  const oxDLF = fnIf(typeof win.oxDLF !== 'undefined', win.oxDLF, {});
  const operation = fnIf(typeof oxDLF[method] !== 'undefined', oxDLF[method], noop);
  operation(...args);
};
