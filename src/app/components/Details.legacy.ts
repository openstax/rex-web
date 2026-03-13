import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';

/**
 * Legacy styled-components exports for backward compatibility.
 *
 * @deprecated These exports are for backward compatibility with existing styled-components usage.
 * New code should use the plain React components from './Details.tsx':
 * - ExpandIcon, CollapseIcon, Summary, Details
 *
 * @example
 * // For styled-components usage (component selectors, styled wrappers):
 * import { ExpandIcon, Summary, Details } from './Details.legacy';
 *
 * // For plain CSS usage (modern approach):
 * import { ExpandIcon, Summary, Details } from './Details';
 */

export const iconSize = 1.7;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
`;

export const ExpandIcon = styled(CaretRight)`
  ${expandCollapseIconStyle}
`;

export const CollapseIcon = styled(CaretDown)`
  ${expandCollapseIconStyle}
`;

export const Summary = styled.summary`
  list-style: none;
  cursor: pointer;

  ::before {
    display: none;
  }

  ::-moz-list-bullet {
    list-style-type: none;
  }

  ::-webkit-details-marker {
    display: none;
  }
`;

export const Details = styled.details`
  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    &[open] > summary ${ExpandIcon} {
      display: none;
    }

    &:not([open]) > summary ${CollapseIcon} {
      display: none;
    }
  `}
`;
