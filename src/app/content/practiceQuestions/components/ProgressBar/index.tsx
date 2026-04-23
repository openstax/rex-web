import React from 'react';
import ProgressBarItem from './ProgressBarItem';
import './index.css';

interface ProgressBarProps {
  total: number;
  activeIndex: number | null;
}

const ProgressBar = ({ total, activeIndex }: ProgressBarProps) => <ul
    className='progress-bar-wrapper'
    aria-labelledby='progress-bar-header'
  >
  {Array.from({ length: total }, (_, index) => <ProgressBarItem
    key={index}
    value={index + 1}
    isActive={index === activeIndex}
    isDisabled={activeIndex === null || index > activeIndex}
  />).map((item) => item)}
</ul>;

export default ProgressBar;
