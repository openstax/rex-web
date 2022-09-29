import React from 'react';
import styled from 'styled-components';
import { TextResizer } from './Topbar/TextResizer';

import { BookWithOSWebData } from '../types';

const TopBar = styled.div`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

interface AssignedTopBarProps {
  bookTheme: BookWithOSWebData['theme'];
}

export const AssignedTopBar = (props: AssignedTopBarProps) => {
  const onChangeTextSize = (e: React.FormEvent<HTMLInputElement>) => console.log(e)

  const onDecreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => console.log(e)

  const onIncreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => console.log(e)

  if (!props.bookTheme) {
    return null;
  }

  return (
    <TopBar>
        <TextResizer
          bookTheme={props.bookTheme}
          onChangeTextSize={onChangeTextSize}
          onDecreaseTextSize={onDecreaseTextSize}
          onIncreaseTextSize={onIncreaseTextSize}
          textSize={1}
          data-testid='text-resizer'
          mobileToolbarOpen={false}
        />
        TopBar
      </TopBar>

  );
}
