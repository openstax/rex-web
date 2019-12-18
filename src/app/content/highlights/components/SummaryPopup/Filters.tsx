import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleDown } from 'styled-icons/fa-solid/AngleDown';
import { PlainButton } from '../../../../components/Button';
import Dropdown from '../../../../components/Dropdown';
import { textStyle } from '../../../../components/Typography/base';
import theme from '../../../../theme';
import ChapterFilter from './ChapterFilter';
import ColorFilter from './ColorFilter';
import { mobilePadding } from './constants';
import { popupPadding } from '../HighlightStyles';

// tslint:disable-next-line:variable-name
const DownIcon = styled(AngleDown)`
  color: ${theme.color.primary.gray.base};
  width: 1rem;
  height: 2rem;
  margin-left: 0.8rem;
`;

// tslint:disable-next-line:variable-name
const Toggle = styled(({label, ...props}) => <PlainButton {...props}>
  <div tabIndex={-1}>
    {label}
    <DownIcon />
  </div>
</PlainButton>)`
  > div {
    outline: none;
    ${textStyle}
    font-size: 1.6rem;
    color: ${theme.color.primary.gray.base};
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Filters = ({className}: Props) => <div className={className}>
  <FormattedMessage id='i18n:highlighting:filters:chapters'>
    {(msg: Element | string) => <Dropdown toggle={<Toggle label={msg} />} transparentTab={false}>
      <ChapterFilter />
    </Dropdown>}
  </FormattedMessage>
  <FormattedMessage id='i18n:highlighting:filters:colors'>
    {(msg: Element | string) => <Dropdown toggle={<Toggle label={msg} />} transparentTab={false}>
      <ColorFilter />
    </Dropdown>}
  </FormattedMessage>
</div>;

export default styled(Filters)`
  overflow: visible;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${popupPadding}rem;
  height: 5.6rem;
  background: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    padding: 0 ${mobilePadding}rem;
    height: 3.6rem;
  `)}

  ${css`
    ${Dropdown}:first-of-type {
      margin-right: 8rem;
      ${theme.breakpoints.mobile(css`
        margin-right: 4.8rem;
      `)}
    }
  `}
`;
