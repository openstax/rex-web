import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../../../theme';
import ProgressBarItem from './ProgressBarItem';

// tslint:disable-next-line: variable-name
const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 3.2rem;
  ${theme.breakpoints.mobile(css`
    margin: 1rem;
  `)}
`;

interface ProgressBarProps {
  total: number;
  activeIndex: number | null;
}

// tslint:disable-next-line: variable-name
const ProgressBar = ({ total, activeIndex }: ProgressBarProps) => <ProgressBarWrapper>
  {Array.from({ length: total }, (_, index) => <ProgressBarItem
    key={index}
    value={index + 1}
    isActive={index === activeIndex}
    isDisabled={activeIndex === null || index > activeIndex}
  />).map((item) => item)}
</ProgressBarWrapper>;

export default ProgressBar;
