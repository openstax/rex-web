import React from 'react';
import styled from 'styled-components/macro';
import { AngleDown } from 'styled-icons/fa-solid/AngleDown';
import Dropdown from '../../../../components/Dropdown';
import { textStyle } from '../../../../components/Typography/base';
import theme from '../../../../theme';
import ColorFilter from './ColorFilter';

// tslint:disable-next-line:variable-name
const DownIcon = styled(AngleDown)`
  color: ${theme.color.primary.gray.base};
  width: 1rem;
  margin-left: 0.8rem;
`;

// tslint:disable-next-line:variable-name
const Toggle = styled(({label, className}) => <div className={className}>
  {label}
  <DownIcon />
</div>)`
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
    <Dropdown toggle={<Toggle label='Color' />}>
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
`;
