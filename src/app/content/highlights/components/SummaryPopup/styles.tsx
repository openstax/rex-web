import React from 'react';
import './styles.css';

export const HighlightEditButtons = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`highlight-edit-buttons ${className || ''}`} {...props} />
);
