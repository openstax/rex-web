import { css } from 'styled-components/macro';

/**
 * CSS class name for hiding elements in print media.
 * Apply this class to elements that should not appear in printed output.
 *
 * Note: The utilities.css file (which defines this class) is imported globally
 * from src/app/index.tsx. Do not import it here to avoid side effects.
 *
 * @example
 * <div className={disablePrintClass}>Not visible in print</div>
 */
export const disablePrintClass = 'disable-print';

/**
 * Legacy styled-components CSS fragment for hiding elements in print media.
 *
 * @deprecated This is a legacy export for backward compatibility.
 * New code should use the `disablePrintClass` className instead.
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
