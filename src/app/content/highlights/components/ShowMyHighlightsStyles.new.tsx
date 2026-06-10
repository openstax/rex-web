import classNames from 'classnames';
import React from 'react';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';
import './ShowMyHighlightsStyles.css';

interface ShowMyHighlightsBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * ShowMyHighlightsBody component - plain CSS version
 * Extends PopupBody with custom background color
 */
export function ShowMyHighlightsBody({ className, style, ...props }: ShowMyHighlightsBodyProps) {
  const { theme: _theme, ...domProps } = props as any;

  return (
    <PopupBody
      {...domProps}
      className={classNames('show-my-highlights-body', className)}
      style={{
        '--show-my-highlights-background': theme.color.neutral.darker,
        ...style,
      } as React.CSSProperties}
    />
  );
}
