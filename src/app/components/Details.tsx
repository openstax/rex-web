import styled, { AnyStyledComponent, css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import '../../polyfill/details';

export const iconSize = 1.7;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
`;

export const ExpandIcon = styled(CaretRight as AnyStyledComponent)`
  ${expandCollapseIconStyle}
`;

export const CollapseIcon = styled(CaretDown as AnyStyledComponent)`
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
