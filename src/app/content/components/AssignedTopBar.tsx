import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageEvent } from '@openstax/types/lib.dom';
import theme from '../../theme';
import { setTextSize } from '../actions';
import * as selectContent from '../selectors';
import { LinkedArchiveTreeSection } from '../types';
import { TopBarWrapper } from './Topbar/styled';
import { TextResizer } from './Topbar/TextResizer';
import { topbarDesktopHeight, topbarMobileHeight } from './constants';
import { TextResizerValue, textResizerValues } from '../constants';
import { useLaunchToken } from '../launchToken';
import './AssignedTopBar.css';

const useTextResizeIntegration = (handleChange: (value: TextResizerValue) => void) => {
  const launchToken = useLaunchToken();

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.parent || window.parent === window) {
      return;
    }

    const win = window;
    const referrer = new URL(win.document.referrer);

    const handler = (event: MessageEvent) => {
      if (
        event.data.type === 'TextSizeUpdate' &&
        event.origin === referrer.origin &&
        textResizerValues.includes(event.data.value as TextResizerValue)
      ) {
        handleChange(event.data.value);
      }
    };

    win.addEventListener('message', handler);
    return () => win.removeEventListener('message', handler);
  }, [handleChange]);

  return typeof launchToken.textSize === 'number';
};

export const AssignedTopBar = (props: {
  section: LinkedArchiveTreeSection;
}) => {
  const bookTheme = useSelector(selectContent.bookTheme);
  const textSize = useSelector(selectContent.textSize);
  const dispatch = useDispatch();

  const handleValueChange = React.useCallback((value: TextResizerValue) => {
    dispatch(setTextSize(value));
  }, [dispatch]);

  const hasIntegration = useTextResizeIntegration(handleValueChange);

  if (hasIntegration) {
    return null;
  }

  return (
    <TopBarWrapper
      className="assigned-topbar-wrapper"
      style={{
        '--assigned-topbar-bg-color': theme.color.neutral.base,
        '--assigned-topbar-text-color': theme.color.text.default,
        '--assigned-topbar-height-desktop': `${topbarDesktopHeight}rem`,
        '--assigned-topbar-height-mobile': `${topbarMobileHeight}rem`,
      } as React.CSSProperties}
    >
      <h2
        className="assigned-topbar-section-title"
        dangerouslySetInnerHTML={{ __html:  props.section?.title }}
      />
      <TextResizer
        bookTheme={bookTheme}
        setTextSize={handleValueChange}
        textSize={textSize}
        data-testid='text-resizer'
        mobileToolbarOpen={false}
        mobileVariant={false}
      />
    </TopBarWrapper>
  );
};
