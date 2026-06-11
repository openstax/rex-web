import React from 'react';
import classNames from 'classnames';
import './styles.css';

export const HighlightEditButtons = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('highlight-edit-buttons', className)} {...props} />
);
