import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';

if (typeof(document) !== 'undefined') {
  import('details-element-polyfill');
}

const iconSize = 1.7;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
`;

// tslint:disable-next-line:variable-name
export const ExpandIcon = styled(CaretRight)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
export const CollapseIcon = styled(CaretDown)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const Details = styled.details`
  ${/* suppress errors from https://github.com/stylelint/stylelint/issues/3391 */ css`
    &[open] > ${Summary} ${ExpandIcon} {
      display: none;
    }

    &:not([open]) > ${Summary} ${CollapseIcon} {
      display: none;
    }
  `}
`;
