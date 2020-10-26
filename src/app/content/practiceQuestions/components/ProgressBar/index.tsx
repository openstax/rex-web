import React from 'react';
import styled from 'styled-components/macro';
import ProgressBarItem from './ProgressBarItem';

// tslint:disable-next-line: variable-name
const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

interface ProgressBarProps {
  total: number;
  activeIndex: number;
}

// tslint:disable-next-line: variable-name
const ProgressBar = ({ total, activeIndex }: ProgressBarProps) => <ProgressBarWrapper>
  {Array.from({ length: total }, (_, index) => <ProgressBarItem
    key={index}
    value={index + 1}
    isActive={index === activeIndex}
    isDisabled={index > activeIndex}
  />).map((item) => item)}
</ProgressBarWrapper>;

export default ProgressBar;
