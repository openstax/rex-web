/**
 * Filters out transient props (props starting with '$') that are used by styled-components
 * but should not be passed to DOM elements.
 *
 * @param props - The props object to filter
 * @returns A new object with transient props removed
 *
 * @example
 * ```tsx
 * function MyComponent(props: MyProps) {
 *   const safeProps = filterTransientProps(props);
 *   return <div {...safeProps}>Content</div>;
 * }
 * ```
 */
export function filterTransientProps<T extends Record<string, unknown>>(
  props: T
): Record<string, unknown> {
  return Object.keys(props).reduce<Record<string, unknown>>((acc, key) => {
    if (!key.startsWith('$')) {
      acc[key] = props[key];
    }
    return acc;
  }, {});
}
