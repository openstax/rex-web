import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleDown } from 'styled-icons/fa-solid/AngleDown';
import { PlainButton } from '../../../../components/Button';
import Dropdown, { DropdownToggle } from '../../../../components/Dropdown';
import { textStyle } from '../../../../components/Typography/base';
import theme from '../../../../theme';
import PrintButton from '../../../components/Toolbar/PrintButton';
import { disablePrint } from '../../../components/utils/disablePrint';
import ChapterFilter from './ChapterFilter';
import ColorFilter from './ColorFilter';
import FiltersList from './FiltersList';

// tslint:disable-next-line:variable-name
const DownIcon = styled(AngleDown)`
  color: ${theme.color.primary.gray.base};
  width: 1rem;
  height: 2rem;
  margin-left: 0.8rem;
  padding-top: 0.2rem;
`;

// tslint:disable-next-line:variable-name
const HighlightsPrintButton = styled(PrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
  padding-right: 2.4rem;
  ${theme.breakpoints.mobile(css`
    padding-right: 2rem;
  `)}
`;

interface ToggleProps {
  label: string;
  isOpen: boolean;
}

// tslint:disable-next-line:variable-name
const Toggle = styled(React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({label, ...props}, ref) => <PlainButton ref={ref} {...props}>
    <div tabIndex={-1}>
      {label}
      <DownIcon />
    </div>
  </PlainButton>
))`
  position: relative;
  padding: 2rem 2.4rem;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  ${theme.breakpoints.mobile(css`
    padding: 1.6rem 2rem;
  `)}
  ${(props: ToggleProps) => props.isOpen
    ? css`
      z-index: 2;
      box-shadow: 0 -0.4rem 0.6rem 0 rgba(0,0,0,0.2);
      background-color: ${theme.color.white};
      border-left: 1px solid ${theme.color.neutral.formBorder};
      border-right: 1px solid ${theme.color.neutral.formBorder};

      ${DownIcon} {
        transform: rotate(180deg);
        padding-top: 0;
        padding-bottom: 0.2rem;
      }
    `
    : null
  }
  > div {
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

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Filters = ({className}: Props) => <div className={className}>
  <FormattedMessage id='i18n:highlighting:filters:chapters'>
    {(msg: Element | string) => <Dropdown
      toggle={<Toggle label={msg} />}
      transparentTab={false}
    >
      <ChapterFilter />
    </Dropdown>}
  </FormattedMessage>
  <FormattedMessage id='i18n:highlighting:filters:colors'>
    {(msg: Element | string) => <Dropdown
      toggle={<Toggle label={msg} />}
      transparentTab={false}
    >
      <ColorFilter />
    </Dropdown>}
  </FormattedMessage>
  <HighlightsPrintButton />
  <FiltersList />
</div>;

export default styled(Filters)`
  position: relative;
  z-index: 2;
  overflow: visible;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  background: ${theme.color.neutral.base};
  border-bottom: 1px solid ${theme.color.neutral.formBorder};
  ${css`
    ${DropdownToggle} {
      font-weight: bold;
    }

    ${Dropdown} {
      & > *:not(${DropdownToggle}) {
        top: calc(100% - 0.1rem);
        box-shadow: 0 0 0.6rem 0 rgba(0, 0, 0, 0.2);
        max-height: calc(100vh - 26rem);
        ${theme.breakpoints.mobile(css`
          max-height: calc(100vh - 19.6rem);
        `)}
      }
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
