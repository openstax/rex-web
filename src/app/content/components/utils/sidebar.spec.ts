import { css } from 'styled-components/macro';
import { styleWhenSidebarClosed, styleWhenTocClosed } from './sidebar';

describe('sidebar utilities', () => {
  describe('styleWhenTocClosed', () => {
    const closedStyle = css`
      display: none;
    `;

    it('returns a css template that can be used by styled-components', () => {
      const result = styleWhenTocClosed(closedStyle);

      // Verify result is defined and is a styled-components CSS object (array)
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Find the interpolation functions in the result array
      // Styled-components css`` tag returns an array with alternating strings and functions
      const interpolationFns = result.filter((item: any) => typeof item === 'function');

      // Should have 2 interpolation functions (mobile breakpoint check and closed state check)
      expect(interpolationFns.length).toBeGreaterThanOrEqual(2);

      // Find the function that checks isTocOpen === false (the closed state check)
      // This is the second interpolation that returns closedStyle directly
      const closedStateFn = interpolationFns.find((fn: any) => {
        // Test with isTocOpen: false to see if it returns closedStyle
        const testResult = fn({ isTocOpen: false });
        return testResult === closedStyle;
      }) as Function;

      expect(closedStateFn).toBeDefined();

      // Verify the closed state function returns closedStyle when isTocOpen is false
      const closedResult = closedStateFn({ isTocOpen: false });
      expect(closedResult).toBe(closedStyle);
      expect(closedResult).toEqual(closedStyle);

      // Verify it returns undefined when isTocOpen is true
      const openResult = closedStateFn({ isTocOpen: true });
      expect(openResult).toBeUndefined();
    });
  });

  describe('styleWhenSidebarClosed', () => {
    const closedStyle = css`
      margin-left: 0;
    `;

    it('returns a css template that can be used by styled-components', () => {
      const result = styleWhenSidebarClosed(closedStyle);

      // Verify result is defined and is a styled-components CSS object (array)
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Find the interpolation functions in the result array
      const interpolationFns = result.filter((item: any) => typeof item === 'function');

      // Should have 2 interpolation functions (mobile breakpoint check and closed state check)
      expect(interpolationFns.length).toBeGreaterThanOrEqual(2);

      // Find the function that checks both isDesktopSearchOpen and isVerticalNavOpen
      // This is the second interpolation that returns closedStyle when both are false
      const closedStateFn = interpolationFns.find((fn: any) => {
        // Test with both false to see if it returns closedStyle
        try {
          const testResult = fn({
            isDesktopSearchOpen: false,
            isVerticalNavOpen: false
          });
          return testResult === closedStyle;
        } catch {
          // If the function doesn't accept these props, it's not the one we're looking for
          return false;
        }
      }) as Function;

      expect(closedStateFn).toBeDefined();

      // Verify the closed state function returns closedStyle when both conditions are false
      const closedResult = closedStateFn({
        isDesktopSearchOpen: false,
        isVerticalNavOpen: false
      });
      expect(closedResult).toBe(closedStyle);
      expect(closedResult).toEqual(closedStyle);

      // Verify it returns undefined when isDesktopSearchOpen is true
      const searchOpenResult = closedStateFn({
        isDesktopSearchOpen: true,
        isVerticalNavOpen: false
      });
      expect(searchOpenResult).toBeUndefined();

      // Verify it returns undefined when isVerticalNavOpen is true
      const navOpenResult = closedStateFn({
        isDesktopSearchOpen: false,
        isVerticalNavOpen: true
      });
      expect(navOpenResult).toBeUndefined();
    });
  });
});
