import React from 'react';
import classNames from 'classnames';
import theme from '../../../../theme';
import './ProgressBarItem.css';

interface ProgressBarItemProps {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
}

const ProgressBarItem = ({ value, isActive, isDisabled }: ProgressBarItemProps) => {
  // Determine line color based on state
  const lineColor = (isActive || isDisabled) ? '#F1F1F1' : theme.color.primary.gray.base;

  return (
    <li
      className="progress-bar-item"
      aria-current={isActive ? 'true' : undefined}
      style={{
        '--progress-bar-line-color': lineColor,
        '--progress-bar-bg': theme.color.primary.gray.base,
        '--progress-bar-border': theme.color.primary.gray.base,
        '--progress-bar-color': theme.color.neutral.base,
        '--progress-bar-active-color': theme.color.primary.gray.base,
        '--progress-bar-active-bg': theme.color.neutral.base,
        '--progress-bar-active-border': theme.color.neutral.base,
      } as React.CSSProperties}
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
