import classNames from 'classnames';
import React from 'react';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';
import './ShowMyHighlightsStyles.css';

interface ShowMyHighlightsBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * ShowMyHighlightsBody component - plain CSS version with forwardRef support
 * Extends PopupBody with custom background color
 */
export const ShowMyHighlightsBody = React.forwardRef<HTMLDivElement, ShowMyHighlightsBodyProps>(
  function ShowMyHighlightsBody({ className, style, theme: _theme, ...domProps }, ref) {
    return (
      <PopupBody
        ref={ref}
        {...domProps}
        className={classNames('show-my-highlights-body', className)}
        style={{
          '--show-my-highlights-background': theme.color.neutral.darker,
          ...style,
        } as React.CSSProperties}
      />
    );
  }
);
