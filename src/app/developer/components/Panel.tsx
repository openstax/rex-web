import React from 'react';
import { H2 } from '../../components/Typography';
import './Panel.css';

interface Props {
  title: string;
}

function Panel({title, children}: React.PropsWithChildren<Props>) {
  return (
    <div>
      <H2>{title}</H2>
      <div className="developer-panel-wrapper">
        {children}
      </div>
    </div>
  );
}

export default Panel;
