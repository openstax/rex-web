import React from 'react';
import styled from 'styled-components/macro';
import ProgressBarItem from './ProgressBarItem';

// tslint:disable-next-line: variable-name
const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

interface ProgressBarProps {
  total: number;
  activeIndex: number;
}

// tslint:disable-next-line: variable-name
const ProgressBar = ({ total, activeIndex }: ProgressBarProps) => {
  const items: Array<() => JSX.Element> = new Array(total);

  for (let index = 0; index < total; index++) {
    items[index] = () => <ProgressBarItem
      value={index + 1}
      isActive={index === activeIndex}
      isDisabled={index > activeIndex}
    />;
  }

  return <ProgressBarWrapper>
    {items.map((item) => item())}
  </ProgressBarWrapper>;
};

export default ProgressBar;
