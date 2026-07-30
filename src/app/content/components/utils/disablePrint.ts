/**
 * CSS class name for hiding elements in print media.
 * Apply this class to elements that should not appear in printed output.
 *
 * Note: The utilities.css file (which defines this class) is imported globally
 * from src/app/index.tsx. Do not import it here to avoid side effects.
 *
 * This module has no dependencies and can be safely imported by plain CSS code.
 *
 * @example
 * <div className={disablePrintClass}>Not visible in print</div>
 */
export const disablePrintClass = 'disable-print';

/**
 * @deprecated Use `disablePrintClass` with className instead.
 * For the styled-components css fragment, import from './disablePrint.legacy'
 */
export { disablePrint } from './disablePrint.legacy';
