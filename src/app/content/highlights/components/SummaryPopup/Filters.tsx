import React from 'react';
import styled from 'styled-components/macro';
import { AngleDown } from 'styled-icons/fa-solid/AngleDown';
import { PlainButton } from '../../../../components/Button';
import Dropdown from '../../../../components/Dropdown';
import { textStyle } from '../../../../components/Typography/base';
import theme from '../../../../theme';
import ChapterFilter from './ChapterFilter';
import ColorFilter from './ColorFilter';

// tslint:disable-next-line:variable-name
const DownIcon = styled(AngleDown)`
  color: ${theme.color.primary.gray.base};
  width: 1rem;
  margin-left: 0.8rem;
`;

// tslint:disable-next-line:variable-name
const Toggle = styled(({label, className}) => <PlainButton className={className}>
  {label}
  <DownIcon />
</PlainButton>)`
  ${textStyle}
  font-size: 1.6rem;
  color: ${theme.color.primary.gray.base};
  display: flex;
  align-items: center;
`;

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Filters = ({className}: Props) => {

  return <div className={className}>
    <Dropdown toggle={<Toggle label='Chapter' />} transparentTab={false}>
      <ChapterFilter />
    </Dropdown>
    <Dropdown toggle={<Toggle label='Color' />} transparentTab={false}>
      <ColorFilter />
    </Dropdown>
  </div>;
};

export default styled(Filters)`
  overflow: visible;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 3.2rem;
  height: 5.6rem;

  ${Dropdown}:first-of-type {
    margin-right: 8rem;
  }
`;
