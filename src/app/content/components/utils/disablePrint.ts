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
 * @deprecated Use `disablePrintClass` with className instead.
 * This export is for backward compatibility with existing styled-components usage.
 * Import from './disablePrint.legacy' if you need the css`` fragment.
 */
export { disablePrint } from './disablePrint.legacy';
