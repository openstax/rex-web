import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleDown } from 'styled-icons/fa-solid/AngleDown';
import { PlainButton } from '../../../components/Button';
import Dropdown, { DropdownToggle, TabHiddenDropdownProps } from '../../../components/Dropdown';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { filters } from '../../styles/PopupConstants';
import { disablePrint } from '../utils/disablePrint';
import FiltersList from './FiltersList';

// tslint:disable-next-line:variable-name
export const AngleIcon = styled(AngleDown)`
  color: ${theme.color.primary.gray.base};
  width: ${filters.dropdownToggle.icon.width}rem;
  height: ${filters.dropdownToggle.icon.height}rem;
  margin-left: 0.8rem;
  padding-top: 0.2rem;
  ${({ direction }: { direction: 'up' | 'down' }) => {
    if (direction === 'up') {
      return `
        transform: rotate(180deg);
        padding-top: 0;
        padding-bottom: 0.2rem;
      `;
    }
  }}
`;

interface ToggleProps {
  label: string;
  isOpen: boolean;
  ariaLabelId: string;
}
// tslint:disable-next-line:variable-name
const Toggle = styled(React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({label, isOpen, ariaLabelId, ...props}, ref) => (
    <FormattedMessage id={ariaLabelId} values={{filter: label}}>
      {(msg: string) => <PlainButton ref={ref} {...props} aria-label={msg}>
        <div tabIndex={-1}>
          {label}
          <AngleIcon direction={isOpen ? 'up' : 'down'} />
        </div>
      </PlainButton>}
    </FormattedMessage>
  )
))`
  position: relative;
  border-left: ${filters.border}rem solid transparent;
  border-right: ${filters.border}rem solid transparent;
  ${(props: ToggleProps) => props.isOpen
    ? css`
      z-index: 2;
      box-shadow: 0 0 0.6rem 0 rgba(0,0,0,0.2);
      clip-path: inset(0 -0.6rem 0px -0.6rem);
      background-color: ${theme.color.white};
      border-left: ${filters.border}rem solid ${theme.color.neutral.formBorder};
      border-right: ${filters.border}rem solid ${theme.color.neutral.formBorder};
    `
    : null
  }
  > div {
    padding: ${filters.dropdownToggle.topBottom.desktop}rem ${filters.dropdownToggle.sides.desktop}rem;
    ${theme.breakpoints.mobile(css`
      padding: ${filters.dropdownToggle.topBottom.mobile}rem ${filters.dropdownToggle.sides.mobile}rem;
    `)}
    outline: none;
    ${textStyle}
    font-size: 1.6rem;
    color: ${theme.color.primary.gray.base};
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
`;

type FilterDropdownProps = {
  label: string;
  ariaLabelId: string;
} & Partial<TabHiddenDropdownProps>;

// tslint:disable-next-line:variable-name
export const FilterDropdown = ({label, ariaLabelId, children, ...props}:
  React.PropsWithChildren<FilterDropdownProps>) =>
    <FormattedMessage id={label}>
      {(msg: Element | string) => <Dropdown
        toggle={<Toggle label={msg} ariaLabelId={ariaLabelId} />}
        transparentTab={false}
        {...props}
      >
        {children}
      </Dropdown>}
    </FormattedMessage>;

// tslint:disable-next-line: variable-name
export const FiltersTopBar = styled.div`
  display: flex;
  align-items: center;
  overflow: visible;
  width: 100%;
`;

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Filters = ({className, children}: React.PropsWithChildren<Props>) => {
  return <div className={className}>
    {children}
  </div>;
};

export default styled(Filters)`
  position: relative;
  z-index: 2;
  overflow: visible;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  background: ${theme.color.neutral.base};
  border-bottom: ${filters.border}rem solid ${theme.color.neutral.formBorder};
  ${css`
    ${DropdownToggle} {
      font-weight: bold;
    }

    ${Dropdown} {
      & > *:not(${DropdownToggle}) {
        top: calc(100% - ${filters.border}rem);
        box-shadow: 0 0 0.6rem 0 rgba(0, 0, 0, 0.2);
        max-height: calc(100vh - ${filters.valueToSubstractFromVH.desktop}rem);
        ${theme.breakpoints.mobile(css`
          max-height: calc(100vh - ${filters.valueToSubstractFromVH.mobile}rem);
        `)}
      }

      ${theme.breakpoints.mobileSmall(css`
        position: initial;

        & > *:not(${DropdownToggle}) {
          top: auto;
          margin-top: -${filters.border}rem;
        }
      `)}
    }
  `}

  @media print {
    padding-left: 0;
  }

  ${css`
    > *:not(${FiltersList}) {
      ${disablePrint}
    }
  `}
`;
