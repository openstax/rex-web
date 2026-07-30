import { css } from 'styled-components/macro';

/**
 * Legacy styled-components CSS fragment for hiding elements in print media.
 *
 * @deprecated This is a legacy export for backward compatibility.
 * New code should use the `disablePrintClass` className instead:
 *
 * @example
 * // Old (styled-components):
 * const Component = styled.div`
 *   ${disablePrint}
 * `;
 *
 * // New (plain CSS):
 * import { disablePrintClass } from './disablePrint';
 * <div className={disablePrintClass}>...</div>
 */
export const disablePrint = css`@media print { display: none; }`;
