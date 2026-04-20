import React from 'react';
import './ErrorIdList.css';

export default ({ids}: {ids: string[]}) => ids.length > 0
  ? <div className="error-id-list">{ids.slice(0, 4).join(', ')}</div>
  : null;
