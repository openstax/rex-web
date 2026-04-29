import React from 'react';
import classNames from 'classnames';
import './ProgressBarItem.css';

interface ProgressBarItemProps {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
}

const ProgressBarItem = ({ value, isActive, isDisabled }: ProgressBarItemProps) => {
  return (
    <li
      className={classNames('progress-bar-item', {
        'progress-bar-item--active': isActive,
        'progress-bar-item--disabled': isDisabled,
      })}
      aria-current={isActive ? 'true' : undefined}
    >
      <span
        className={classNames('progress-bar-item__circle', {
          'progress-bar-item__circle--active': isActive,
          'progress-bar-item__circle--disabled': isDisabled,
        })}
      >
        {value}
      </span>
    </li>
  );
};

export default ProgressBarItem;
